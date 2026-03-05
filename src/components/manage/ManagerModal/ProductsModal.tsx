'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PencilSimple, Trash } from '@phosphor-icons/react';
import { Button } from '@/components/common/Button';
import IconButton from '@/components/common/IconButton';
import ManagerModal from './ManagerModal';
import FormOverlay from './FormOverlay';
import ImageUploadZone from '@/components/manage/editors/ImageUploadZone';
import { MOCK_PRODUCTS, MOCK_PRODUCT_STYLES } from '@/lib/mock-data';
import { useChat } from '@/lib/chat-context';
import styles from './ManagerModal.module.css';

type TabId = 'products' | 'styles';

type ProductFormMode = { type: 'product'; product?: { id: string; name: string; category: string; image: string } } | null;
type StyleFormMode = {
  type: 'style';
  style?: { id: string; name: string; description: string; image: string; previews: string[] };
} | null;

export default function ProductsModal() {
  const { state, dispatch } = useChat();
  const [activeTab, setActiveTab] = useState<TabId>('products');

  // Product form overlay
  const [productForm, setProductForm] = useState<ProductFormMode>(null);
  const [productImage, setProductImage] = useState<string[]>([]);
  const [productTitle, setProductTitle] = useState('');
  const [productCaption, setProductCaption] = useState('');

  // Product style form overlay
  const [styleForm, setStyleForm] = useState<StyleFormMode>(null);
  const [formOnlyMode, setFormOnlyMode] = useState(false);
  const [styleName, setStyleName] = useState('');
  const [styleImages, setStyleImages] = useState<string[]>([]);
  const [styleDos, setStyleDos] = useState('');
  const [styleDonts, setStyleDonts] = useState('');

  const handleClose = () => {
    dispatch({ type: 'SET_MANAGER_MODAL', payload: null });
    setProductForm(null);
    setStyleForm(null);
    setFormOnlyMode(false);
  };

  const openProductForm = (product?: { id: string; name: string; category: string; image: string }) => {
    setProductForm({ type: 'product', product });
    setProductImage(product ? [product.image] : []);
    setProductTitle(product?.name ?? '');
    setProductCaption(product?.category ?? '');
  };

  const closeProductForm = () => {
    if (formOnlyMode) {
      dispatch({ type: 'SET_MANAGER_MODAL', payload: null });
      return;
    }
    setProductForm(null);
    setProductImage([]);
    setProductTitle('');
    setProductCaption('');
  };

  const openStyleForm = (
    style?: { id: string; name: string; description: string; image: string; previews: string[] }
  ) => {
    setStyleForm({ type: 'style', style });
    setStyleName(style?.name ?? '');
    setStyleImages(style?.previews ?? []);
    setStyleDos('');
    setStyleDonts('');
  };

  const closeStyleForm = () => {
    if (formOnlyMode) {
      dispatch({ type: 'SET_MANAGER_MODAL', payload: null });
      return;
    }
    setStyleForm(null);
    setStyleName('');
    setStyleImages([]);
    setStyleDos('');
    setStyleDonts('');
  };

  const handleSaveProduct = () => {
    closeProductForm();
  };

  const handleSaveStyle = () => {
    closeStyleForm();
  };

  const formInit = state.managerModalFormInit;
  useEffect(() => {
    if (formInit?.modal === 'products') {
      setFormOnlyMode(true);
      if (formInit.tab === 'products') {
        const item = formInit.action === 'edit' && formInit.item
          ? (formInit.item as { id: string; name: string; category: string; image: string })
          : undefined;
        openProductForm(item);
      } else {
        const item = formInit.action === 'edit' && formInit.item
          ? (formInit.item as { id: string; name: string; description: string; image: string; previews: string[] })
          : undefined;
        openStyleForm(item);
      }
      dispatch({ type: 'SET_MANAGER_MODAL_FORM_INIT', payload: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- formInit is the trigger
  }, [formInit?.modal, formInit?.action, formInit?.tab, formInit?.item]);

  const tabs = [
    { id: 'products' as TabId, label: 'Products' },
    { id: 'styles' as TabId, label: 'Product Styles' },
  ];

  if (formOnlyMode) {
    if (!productForm && !styleForm) return null;
    if (productForm) {
      return (
        <AnimatePresence>
          <FormOverlay
            key="product-form"
            title={productForm.product ? 'Edit Product' : 'Add Product'}
            onClose={closeProductForm}
          >
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Product Image</label>
              <ImageUploadZone
                images={productImage}
                onChange={setProductImage}
                maxImages={1}
                label="Drop product image or click to upload"
                sublabel="Single image (PNG, JPG, WebP)"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Title
              </label>
              <input
                className={styles.fieldInput}
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="e.g. Wireless Headphones"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Caption
              </label>
              <input
                className={styles.fieldInput}
                value={productCaption}
                onChange={(e) => setProductCaption(e.target.value)}
                placeholder="Short description of the product"
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Button variant="primary" size="sm" onClick={handleSaveProduct}>
                  Save Product
                </Button>
                <Button variant="secondary" size="sm" onClick={closeProductForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </FormOverlay>
        </AnimatePresence>
      );
    }
    if (styleForm) {
      return (
        <AnimatePresence>
          <FormOverlay
            key="style-form"
            title={styleForm.style ? 'Edit Product Style' : 'Add Product Style'}
            onClose={closeStyleForm}
          >
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Style Name</label>
              <input
                className={styles.fieldInput}
                value={styleName}
                onChange={(e) => setStyleName(e.target.value)}
                placeholder="e.g. Studio shot, Lifestyle"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Reference Images
              </label>
              <ImageUploadZone
                images={styleImages}
                onChange={setStyleImages}
                maxImages={10}
                label="Drop images here or click to upload"
                sublabel="Up to 10 images (PNG, JPG, WebP)"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Do&apos;s
              </label>
              <textarea
                className={styles.fieldTextarea}
                value={styleDos}
                onChange={(e) => setStyleDos(e.target.value)}
                placeholder="What should the AI do for this style? e.g. Use soft lighting, neutral background"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Don&apos;ts
              </label>
              <textarea
                className={styles.fieldTextarea}
                value={styleDonts}
                onChange={(e) => setStyleDonts(e.target.value)}
                placeholder="What should the AI avoid? e.g. No harsh shadows, no busy backgrounds"
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Button variant="primary" size="sm" onClick={handleSaveStyle}>
                  Save Style
                </Button>
                <Button variant="secondary" size="sm" onClick={closeStyleForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </FormOverlay>
        </AnimatePresence>
      );
    }
  }

  return (
    <>
      <ManagerModal
        title="Manage Products"
        onClose={handleClose}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as TabId)}
      >
        {activeTab === 'products' && (
          <>
            <div className={styles.sectionTitle}>Products</div>
            <p className={styles.sectionDescription}>
              Upload products with title and caption. Each product appears as an image with metadata.
            </p>
            <button className={styles.btnPrimary} onClick={() => openProductForm()} style={{ marginBottom: 16 }}>
              Add Product
            </button>
            {MOCK_PRODUCTS.length > 0 ? (
              <div className={styles.list}>
                {MOCK_PRODUCTS.map((product) => (
                  <div key={product.id} className={styles.listItem} onClick={() => openProductForm(product)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image} alt="" className={styles.listItemThumb} />
                    <div className={styles.listItemInfo}>
                      <span className={styles.listItemName}>{product.name}</span>
                      <span className={styles.listItemMeta}>{product.category}</span>
                    </div>
                    <div className={styles.listItemActions} onClick={(e) => e.stopPropagation()}>
                      <IconButton variant="ghost" size="sm" title="Edit" onClick={() => openProductForm(product)}>
                        <PencilSimple size={14} />
                      </IconButton>
                      <IconButton variant="ghost" size="sm" color="danger" title="Delete">
                        <Trash size={14} />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <p>No products yet</p>
                <p>Add your first product to get started.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'styles' && (
          <>
            <div className={styles.sectionTitle}>Product Styles</div>
            <p className={styles.sectionDescription}>
              Create shot styles with reference images and do&apos;s/don&apos;ts for the AI.
            </p>
            <Button variant="primary" size="sm" onClick={() => openStyleForm()} style={{ marginBottom: 16 }}>
              Add Product Style
            </Button>
            {MOCK_PRODUCT_STYLES.length > 0 ? (
              <div className={styles.list}>
                {MOCK_PRODUCT_STYLES.map((style) => (
                  <div key={style.id} className={styles.listItem} onClick={() => openStyleForm(style)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={style.image} alt="" className={styles.listItemThumb} />
                    <div className={styles.listItemInfo}>
                      <span className={styles.listItemName}>{style.name}</span>
                      <span className={styles.listItemMeta}>{style.description}</span>
                    </div>
                    <div className={styles.listItemActions} onClick={(e) => e.stopPropagation()}>
                      <IconButton variant="ghost" size="sm" title="Edit" onClick={() => openStyleForm(style)}>
                        <PencilSimple size={14} />
                      </IconButton>
                      <IconButton variant="ghost" size="sm" color="danger" title="Delete">
                        <Trash size={14} />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <p>No product styles yet</p>
                <p>Add your first style to get started.</p>
              </div>
            )}
          </>
        )}
      </ManagerModal>

      <AnimatePresence>
        {productForm && !formOnlyMode && (
          <FormOverlay
            key="product-form"
            title={productForm.product ? 'Edit Product' : 'Add Product'}
            onClose={closeProductForm}
          >
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Product Image</label>
              <ImageUploadZone
                images={productImage}
                onChange={setProductImage}
                maxImages={1}
                label="Drop product image or click to upload"
                sublabel="Single image (PNG, JPG, WebP)"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Title
              </label>
              <input
                className={styles.fieldInput}
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="e.g. Wireless Headphones"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Caption
              </label>
              <input
                className={styles.fieldInput}
                value={productCaption}
                onChange={(e) => setProductCaption(e.target.value)}
                placeholder="Short description of the product"
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Button variant="primary" size="sm" onClick={handleSaveProduct}>
                  Save Product
                </Button>
                <Button variant="secondary" size="sm" onClick={closeProductForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </FormOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {styleForm && !formOnlyMode && (
          <FormOverlay
            key="style-form"
            title={styleForm.style ? 'Edit Product Style' : 'Add Product Style'}
            onClose={closeStyleForm}
          >
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Style Name</label>
              <input
                className={styles.fieldInput}
                value={styleName}
                onChange={(e) => setStyleName(e.target.value)}
                placeholder="e.g. Studio shot, Lifestyle"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Reference Images
              </label>
              <ImageUploadZone
                images={styleImages}
                onChange={setStyleImages}
                maxImages={10}
                label="Drop images here or click to upload"
                sublabel="Up to 10 images (PNG, JPG, WebP)"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Do&apos;s
              </label>
              <textarea
                className={styles.fieldTextarea}
                value={styleDos}
                onChange={(e) => setStyleDos(e.target.value)}
                placeholder="What should the AI do for this style? e.g. Use soft lighting, neutral background"
              />
              <label className={styles.fieldLabel} style={{ marginTop: 12 }}>
                Don&apos;ts
              </label>
              <textarea
                className={styles.fieldTextarea}
                value={styleDonts}
                onChange={(e) => setStyleDonts(e.target.value)}
                placeholder="What should the AI avoid? e.g. No harsh shadows, no busy backgrounds"
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <Button variant="primary" size="sm" onClick={handleSaveStyle}>
                  Save Style
                </Button>
                <Button variant="secondary" size="sm" onClick={closeStyleForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </FormOverlay>
        )}
      </AnimatePresence>
    </>
  );
}
