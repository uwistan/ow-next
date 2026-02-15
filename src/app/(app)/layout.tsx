'use client';

import { AnimatePresence } from 'framer-motion';
import TopBar from '@/components/layout/TopBar/TopBar';
import ViewTransition from '@/components/layout/ViewTransition/ViewTransition';
import ChatLanding from '@/components/chat/ChatLanding/ChatLanding';
import EditCanvas from '@/components/chat/EditCanvas/EditCanvas';
import ChatHistory from '@/components/chat/ChatHistory/ChatHistory';
import LibraryView from '@/components/library/LibraryView/LibraryView';
import { ChatProvider, useChat } from '@/lib/chat-context';
import styles from './layout.module.css';

function CreateView() {
  const { state } = useChat();

  return (
    <div className={styles.createView}>
      <div className={state.canvasOpen ? styles.splitLayout : styles.fullLayout}>
        <div className={state.canvasOpen ? styles.chatPanel : styles.chatPanelFull}>
          <ChatLanding />
        </div>
        <AnimatePresence>
          {state.canvasOpen && (
            <div className={styles.canvasPanel}>
              <EditCanvas />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LibraryPanel() {
  return (
    <div className={styles.libraryView}>
      <LibraryView />
    </div>
  );
}

function AppShell() {
  const { state } = useChat();

  return (
    <div className={styles.shell}>
      <TopBar />
      <ViewTransition
        createView={<CreateView />}
        libraryView={<LibraryPanel />}
      />
      <AnimatePresence>
        {state.historyOpen && <ChatHistory />}
      </AnimatePresence>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <AppShell />
    </ChatProvider>
  );
}
