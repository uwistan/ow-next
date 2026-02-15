'use client';

import { useState } from 'react';
import { ClockCounterClockwise } from '@phosphor-icons/react';
import ChatInput from '@/components/chat/ChatInput/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages/ChatMessages';
import FeatureCards from '@/components/chat/FeatureCards/FeatureCards';
import { useChat, CreativeMode } from '@/lib/chat-context';
import { MOCK_IMAGES } from '@/lib/mock-data';
import styles from './ChatLanding.module.css';

/** Keywords that hint at a specific creative mode */
const MODE_KEYWORDS: { mode: CreativeMode; patterns: RegExp[] }[] = [
  {
    mode: 'imagine',
    patterns: [
      /\b(generate|create|make|build)\b.*\b(image|picture|photo|visual|video|clip)\b/i,
      /\b(image|picture|photo|visual|video|illustration)\b.*\b(of|with|for|showing)\b/i,
      /\bimagine\b/i,
    ],
  },
  {
    mode: 'product',
    patterns: [
      /\b(product)\b.*\b(shot|photo|image|picture|shoot)\b/i,
      /\b(shoot|photograph)\b.*\b(product|item)\b/i,
      /\bproduct\s?(shot|photo|image)\b/i,
    ],
  },
  {
    mode: 'character',
    patterns: [
      /\b(character|testimonial|person|portrait)\b/i,
      /\b(with|featuring)\b.*\b(sarah|marcus|elena|karen|michael|james)\b/i,
    ],
  },
  {
    mode: 'create',
    patterns: [
      /\b(ad|ads|advertisement|banner|campaign|story|post)\b/i,
      /\b(instagram|facebook|linkedin|youtube|social\s?media)\b/i,
    ],
  },
];

function detectMode(message: string): CreativeMode | null {
  for (const { mode, patterns } of MODE_KEYWORDS) {
    if (patterns.some((re) => re.test(message))) {
      return mode;
    }
  }
  return null;
}

const MODE_HEADLINES: Record<CreativeMode, { greeting: string; sub: string }> = {
  idle: {
    greeting: 'Hey, I\u2019m your brand AI.',
    sub: 'Ask me anything about your brand, create on-brand content, or just start a conversation.',
  },
  imagine: {
    greeting: 'Let\u2019s bring your vision to life.',
    sub: 'Describe what you see \u2014 I\u2019ll generate on-brand images and videos for you.',
  },
  product: {
    greeting: 'Showcase your products beautifully.',
    sub: 'Pick a product, choose a style, and tell me the scene you have in mind.',
  },
  character: {
    greeting: 'Create scenes with your characters.',
    sub: 'Select your brand characters and describe the moment \u2014 I\u2019ll make it real.',
  },
  create: {
    greeting: 'Design ads that stay on brand.',
    sub: 'Choose a format, set the style, and describe the ad you need.',
  },
};

export default function ChatLanding() {
  const { state, dispatch } = useChat();
  const [isGenerating, setIsGenerating] = useState(false);

  const hasMessages = state.currentSession && state.currentSession.messages.length > 0;
  const headline = MODE_HEADLINES[state.mode];

  const handleSend = (message: string) => {
    // Auto-detect mode if currently idle
    if (state.mode === 'idle') {
      const detected = detectMode(message);
      if (detected) {
        dispatch({ type: 'SET_MODE', payload: detected });
      }
    }

    const msg = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: message,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'SEND_MESSAGE', payload: msg });
    setIsGenerating(true);

    // Use the mode that will be current after potential auto-detect
    const activeMode = state.mode === 'idle' ? (detectMode(message) ?? 'idle') : state.mode;

    // Simulate assistant response
    setTimeout(() => {
      const response = {
        id: `msg-${Date.now()}`,
        role: 'assistant' as const,
        content: getAssistantResponse(activeMode, message),
        timestamp: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_ASSISTANT_MESSAGE', payload: response });
      setIsGenerating(false);

      // If in a creative mode, simulate generating an asset
      if (activeMode !== 'idle') {
        setTimeout(() => {
          const randomImg = MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)];
          dispatch({
            type: 'ADD_GENERATED_ASSET',
            payload: {
              id: `asset-${Date.now()}`,
              url: randomImg.url,
              prompt: message,
              type: state.imagineOptions.outputType,
              savedToLibrary: false,
            },
          });
        }, 1500);
      }
    }, 1200);
  };

  const historyButton = (
    <button
      className={styles.historyButton}
      onClick={() => dispatch({ type: 'SET_HISTORY_OPEN', payload: !state.historyOpen })}
    >
      <ClockCounterClockwise size={16} weight="bold" />
      History
    </button>
  );

  // Landing / idle state
  if (!hasMessages) {
    return (
      <div className={styles.landing}>
        <div className={styles.content}>
          <h1 className={styles.greeting}>{headline.greeting}</h1>
          <p className={styles.subgreeting}>{headline.sub}</p>
          <ChatInput onSend={handleSend} />
          {state.mode === 'idle' && <FeatureCards />}
        </div>
        <div className={styles.historyDock}>{historyButton}</div>
      </div>
    );
  }

  // Active chat state
  return (
    <div className={styles.activeChat}>
      <ChatMessages
        messages={state.currentSession!.messages}
        isGenerating={isGenerating}
      />
      <div className={styles.inputDock}>
        <ChatInput onSend={handleSend} />
      </div>
      <div className={styles.historyDock}>{historyButton}</div>
    </div>
  );
}

function getAssistantResponse(mode: string, message: string): string {
  switch (mode) {
    case 'imagine':
      return `I'll generate that for you! Based on your brand guidelines, I'm creating visuals matching: "${message}". This will take just a moment...`;
    case 'product':
      return `Great choice! I'll create a product shot based on: "${message}". Let me work on that...`;
    case 'character':
      return `I'll create a character scene for: "${message}". Working on it now...`;
    case 'create':
      return `I'll design an ad based on: "${message}". Let me put that together...`;
    default:
      return `I'd be happy to help with that! I know your brand inside and out — feel free to ask me anything about your guidelines, assets, or content strategy. Or use the shortcuts below to jump straight into creating.`;
  }
}
