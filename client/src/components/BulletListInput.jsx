import React, { useRef } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Check, Sparkles } from 'lucide-react';

export default function BulletListInput({
  title,
  icon: Icon,
  items,
  setItems,
  placeholder = 'Type item and press Enter...',
  accentColor = 'emerald', // 'emerald', 'teal', 'amber', 'indigo'
  onMoveToCompleted = null, // Optional callback to move a target to completed
  moveToLabel = 'Done'
}) {
  const inputRefs = useRef([]);

  const handleItemChange = (index, value) => {
    const updated = [...items];
    updated[index] = value;
    setItems(updated);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Add new item after current index
      const updated = [...items];
      updated.splice(index + 1, 0, '');
      setItems(updated);
      setTimeout(() => {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
        }
      }, 50);
    } else if (e.key === 'Backspace' && items[index] === '' && items.length > 1) {
      e.preventDefault();
      const updated = items.filter((_, i) => i !== index);
      setItems(updated);
      const prevIndex = Math.max(0, index - 1);
      setTimeout(() => {
        if (inputRefs.current[prevIndex]) {
          inputRefs.current[prevIndex].focus();
        }
      }, 50);
    }
  };

  const addItem = () => {
    const updated = [...items, ''];
    setItems(updated);
    setTimeout(() => {
      const lastIndex = updated.length - 1;
      if (inputRefs.current[lastIndex]) {
        inputRefs.current[lastIndex].focus();
      }
    }, 50);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      setItems(['']); // Keep at least one empty item
      return;
    }
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const moveItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setItems(updated);
  };

  // Color mappings
  const themeClasses = {
    emerald: {
      card: 'border-emerald-200 bg-emerald-50/30',
      header: 'text-emerald-900',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: 'text-emerald-600',
      number: 'bg-emerald-600 text-white',
      inputFocus: 'focus:border-emerald-500 focus:ring-emerald-500/20',
      addBtn: 'text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200 border-emerald-300'
    },
    teal: {
      card: 'border-teal-200 bg-teal-50/30',
      header: 'text-teal-900',
      badge: 'bg-teal-100 text-teal-800 border-teal-300',
      icon: 'text-teal-600',
      number: 'bg-teal-600 text-white',
      inputFocus: 'focus:border-teal-500 focus:ring-teal-500/20',
      addBtn: 'text-teal-700 bg-teal-100/80 hover:bg-teal-200 border-teal-300'
    },
    amber: {
      card: 'border-amber-200 bg-amber-50/30',
      header: 'text-amber-900',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: 'text-amber-600',
      number: 'bg-amber-600 text-white',
      inputFocus: 'focus:border-amber-500 focus:ring-amber-500/20',
      addBtn: 'text-amber-700 bg-amber-100/80 hover:bg-amber-200 border-amber-300'
    },
    indigo: {
      card: 'border-indigo-200 bg-indigo-50/30',
      header: 'text-indigo-900',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      icon: 'text-indigo-600',
      number: 'bg-indigo-600 text-white',
      inputFocus: 'focus:border-indigo-500 focus:ring-indigo-500/20',
      addBtn: 'text-indigo-700 bg-indigo-100/80 hover:bg-indigo-200 border-indigo-300'
    }
  };

  const theme = themeClasses[accentColor] || themeClasses.emerald;
  const activeCount = items.filter(t => t.trim().length > 0).length;

  return (
    <div className={`p-5 rounded-2xl border shadow-sm transition-all duration-200 bg-white ${theme.card}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-200/80">
              <Icon className={`w-5 h-5 ${theme.icon}`} />
            </div>
          )}
          <div>
            <h3 className={`text-base font-bold m-0 ${theme.header}`}>{title}</h3>
            <span className="text-xs text-slate-500">Press Enter ↵ to quickly add next point</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${theme.badge}`}>
            {activeCount} {activeCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* List Items */}
      <div className="space-y-2.5">
        {items.map((item, index) => (
          <div 
            key={index}
            className="group flex items-start gap-2.5 p-1.5 rounded-xl bg-white/80 border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs"
          >
            {/* Number badge */}
            <div className={`shrink-0 w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center mt-1 shadow-2xs ${theme.number}`}>
              {index + 1}
            </div>

            {/* Input textarea/input */}
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              placeholder={placeholder}
              className={`flex-1 min-w-0 px-3 py-2 text-base sm:text-sm bg-transparent border-0 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 ${theme.inputFocus}`}
            />

            {/* Actions for this item */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 mt-0.5">
              
              {/* Optional Move to Completed Action */}
              {onMoveToCompleted && item.trim() && (
                <button
                  type="button"
                  title="Mark done & add to Work Completed"
                  onClick={() => onMoveToCompleted(index)}
                  className="flex items-center gap-1 text-xs px-2 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-semibold rounded-md border border-emerald-300 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{moveToLabel}</span>
                </button>
              )}

              {/* Move up */}
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  title="Move Up"
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Move down */}
              {index < items.length - 1 && (
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  title="Move Down"
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeItem(index)}
                title="Remove item"
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Add button */}
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={addItem}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${theme.addBtn}`}
        >
          <Plus className="w-4 h-4" />
          Add Point
        </button>

        <span className="text-2xs text-slate-400">
          Tip: Hit [Enter] key in any box to add next
        </span>
      </div>

    </div>
  );
}
