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
import CharactersList from '@/components/manage/ManagePanel/CharactersList';
import ImageStyleModal from '@/components/manage/ManagerModal/ImageStyleModal';
import ProductsModal from '@/components/manage/ManagerModal/ProductsModal';
import CharactersModal from '@/components/manage/ManagerModal/CharactersModal';
import { ChatProvider, useChat } from '@/lib/chat-context';
import { BrandProvider } from '@/lib/brand-context';
import styles from './layout.module.css';

function CreateView() {
  const { state } = useChat();
  const hasImageSession =
    (state.mode === 'imagine' || state.mode === 'product' || state.mode === 'character') &&
    state.currentSession &&
    (state.currentSession.messages.length > 0 || state.currentSession.generatedAssets.length > 0);
  const showSplitCanvas =
    state.canvasOpen && !hasImageSession;

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
      {state.activeManagePanel === 'characters' && <CharactersList />}
    </AnimatePresence>
  );
}

function ManagerModalSwitch() {
  const { state } = useChat();
  return (
    <AnimatePresence>
      {state.activeManagerModal === 'imageStyle' && <ImageStyleModal key="imageStyle" />}
      {state.activeManagerModal === 'products' && <ProductsModal key="products" />}
      {state.activeManagerModal === 'characters' && <CharactersModal key="characters" />}
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
      <ManagerModalSwitch />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrandProvider>
      <ChatProvider>
        <AppShell />
        {children}
      </ChatProvider>
    </BrandProvider>
  );
}
