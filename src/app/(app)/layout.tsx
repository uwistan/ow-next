'use client';

import { AnimatePresence } from 'framer-motion';
import TopBar from '@/components/layout/TopBar/TopBar';
import ViewTransition from '@/components/layout/ViewTransition/ViewTransition';
import ChatLanding from '@/components/chat/ChatLanding/ChatLanding';
import EditCanvas from '@/components/chat/EditCanvas/EditCanvas';
import ChatHistory from '@/components/chat/ChatHistory/ChatHistory';
import LibraryView from '@/components/library/LibraryView/LibraryView';
import StylesList from '@/components/manage/ManagePanel/StylesList';
import ProductsList from '@/components/manage/ManagePanel/ProductsList';
import ShotsList from '@/components/manage/ManagePanel/ShotsList';
import CharactersList from '@/components/manage/ManagePanel/CharactersList';
import { ChatProvider, useChat } from '@/lib/chat-context';
import { BrandProvider } from '@/lib/brand-context';
import styles from './layout.module.css';

function CreateView() {
  const { state } = useChat();
  const hasImagineSession =
    state.mode === 'imagine' &&
    state.currentSession &&
    state.currentSession.messages.length > 0;
  const showSplitCanvas =
    state.canvasOpen && !hasImagineSession;

  return (
    <div className={styles.createView}>
      <div className={showSplitCanvas ? styles.splitLayout : styles.fullLayout}>
        <div className={showSplitCanvas ? styles.chatPanel : styles.chatPanelFull}>
          <ChatLanding />
        </div>
        <AnimatePresence>
          {showSplitCanvas && (
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

function ManagePanelSwitch() {
  const { state } = useChat();
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/9e12a5bc-bcf8-4863-ba85-1864bc6b6f1f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout.tsx:ManagePanelSwitch',message:'ManagePanelSwitch rendered',data:{activeManagePanel:state.activeManagePanel},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  return (
    <AnimatePresence>
      {state.activeManagePanel === 'styles' && <StylesList />}
      {state.activeManagePanel === 'products' && <ProductsList />}
      {state.activeManagePanel === 'shots' && <ShotsList />}
      {state.activeManagePanel === 'characters' && <CharactersList />}
    </AnimatePresence>
  );
}

function AppShell() {
  const { state } = useChat();
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/9e12a5bc-bcf8-4863-ba85-1864bc6b6f1f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout.tsx:AppShell',message:'AppShell rendered',data:{activeView:state.activeView,mode:state.mode},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
  // #endregion

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
      <ManagePanelSwitch />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/9e12a5bc-bcf8-4863-ba85-1864bc6b6f1f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout.tsx:AppLayout',message:'AppLayout rendered',data:{},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  return (
    <BrandProvider>
      <ChatProvider>
        <AppShell />
        {children}
      </ChatProvider>
    </BrandProvider>
  );
}
