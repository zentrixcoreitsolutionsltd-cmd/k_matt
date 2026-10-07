import React from 'react';
import { X, ShoppingCart, Check, Trash2, Star } from 'lucide-react';
import { Product } from '../types';
import { formatMoney } from '../data/catalog';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareList?: number[];
  products: Product[];
  onRemove?: (id: number) => void;
  onRemoveCompare?: (id: number) => void;
  onAddToCart: (p: Product, quantity?: number) => void;
  addedProductId?: number | null;
}

export default function CompareModal({
  isOpen,
  onClose,
  compareList,
  products,
  onRemove,
  onRemoveCompare,
  onAddToCart,
  addedProductId
}: CompareModalProps) {
  if (!isOpen) return null;

  const compareProducts = compareList ? products.filter(p => compareList.includes(p.id)) : products;
  const handleRemove = (id: number) => {
    if (onRemove) onRemove(id);
    else if (onRemoveCompare) onRemoveCompare(id);
  };

  return (
    <div className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-gray-150 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl animate-scale-up">
        <div className="bg-plum text-white p-5 flex items-center justify-between">
          <h3 className="font-extrabold text-base">Product Comparison Tool ({compareProducts.length})</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-x-auto text-xs">
          {compareProducts.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No products selected for comparison.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareProducts.map(p => (
                <div key={p.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-150 flex flex-col justify-between">
                  <div className="space-y-3">
                    <img src={p.image} alt={p.name} className="w-full h-32 object-cover rounded-xl bg-white" />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-400">{p.brand}</span>
                      <h4 className="font-bold text-gray-900 line-clamp-2">{p.name}</h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-black text-plum">{formatMoney(p.price)}</span>
                        {p.originalPrice > p.price && (
                          <span className="text-xs text-gray-400 line-through font-extrabold">
                            {formatMoney(p.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 text-gray-600 pt-2 border-t border-gray-200">
                      <p><strong>Stock:</strong> {p.stock > 0 ? `${p.stock} units` : 'Out of Stock'}</p>
                      <p className="flex items-center gap-1.5">
                        <strong>Rating:</strong> 
                        <Star className="w-3.5 h-3.5 fill-plum text-plum inline" /> 
                        <span className="font-extrabold text-plum">{p.rating} / 5</span>
                      </p>
                      <p className="line-clamp-3"><strong>Description:</strong> {p.description}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button 
                      onClick={() => onAddToCart(p)}
                      disabled={p.stock <= 0}
                      className="flex-1 bg-plum hover:bg-plum-dark text-white font-extrabold py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-plum/20 transition-all uppercase text-xs tracking-wider"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                    <button 
                      onClick={() => handleRemove(p.id)}
                      className="p-2 border border-gray-250 text-gray-400 hover:text-red-500 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
