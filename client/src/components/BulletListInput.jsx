import React, { useRef } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Check } from 'lucide-react';

export default function BulletListInput({
  title,
  icon: Icon,
  items,
  setItems,
  placeholder = 'Add a task or bullet point...',
  accentColor = 'emerald',
  onMoveToCompleted = null,
  moveToLabel = 'Done',
  onInputFocus = null,
  onInputBlur = null
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
      const updated = [...items];
      updated.splice(index + 1, 0, '');
      setItems(updated);
      setTimeout(() => {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
        }
      }, 40);
    } else if (e.key === 'Backspace' && items[index] === '' && items.length > 1) {
      e.preventDefault();
      const updated = items.filter((_, i) => i !== index);
      setItems(updated);
      const prevIndex = Math.max(0, index - 1);
      setTimeout(() => {
        if (inputRefs.current[prevIndex]) {
          inputRefs.current[prevIndex].focus();
        }
      }, 40);
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
    }, 40);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      setItems(['']);
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

  const themeClasses = {
    emerald: {
      card: 'border-emerald-200 bg-emerald-50/20',
      header: 'text-emerald-950',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: 'text-emerald-700',
      number: 'bg-emerald-600 text-white',
      inputFocus: 'focus:border-emerald-500 focus:ring-emerald-500/20',
      addBtn: 'text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 active:bg-emerald-300 border-emerald-300'
    },
    teal: {
      card: 'border-teal-200 bg-teal-50/20',
      header: 'text-teal-950',
      badge: 'bg-teal-100 text-teal-800 border-teal-300',
      icon: 'text-teal-700',
      number: 'bg-teal-600 text-white',
      inputFocus: 'focus:border-teal-500 focus:ring-teal-500/20',
      addBtn: 'text-teal-800 bg-teal-100/90 hover:bg-teal-200 active:bg-teal-300 border-teal-300'
    },
    amber: {
      card: 'border-amber-200 bg-amber-50/20',
      header: 'text-amber-950',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: 'text-amber-700',
      number: 'bg-amber-600 text-white',
      inputFocus: 'focus:border-amber-500 focus:ring-amber-500/20',
      addBtn: 'text-amber-800 bg-amber-100/90 hover:bg-amber-200 active:bg-amber-300 border-amber-300'
    }
  };

  const theme = themeClasses[accentColor] || themeClasses.emerald;
  const activeCount = items.filter(t => t.trim().length > 0).length;

  return (
    <div className={`p-3.5 sm:p-5 rounded-2xl border shadow-xs transition-all duration-200 bg-white ${theme.card}`}>
      
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-1.5 sm:p-2 rounded-xl bg-white shadow-2xs border border-slate-200 shrink-0">
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.icon}`} />
            </div>
          )}
          <div>
            <h3 className={`text-sm sm:text-base font-bold m-0 leading-tight ${theme.header}`}>
              {title}
            </h3>
            <span className="text-2xs text-slate-400 hidden sm:inline">Press Enter ↵ to add next item</span>
          </div>
        </div>

        <span className={`text-2xs sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-bold border shrink-0 ${theme.badge}`}>
          {activeCount} {activeCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Bullet Items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div 
            key={index}
            className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all shadow-2xs"
          >
            {/* Number Pill */}
            <div className={`shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg text-2xs sm:text-xs font-bold flex items-center justify-center ${theme.number}`}>
              {index + 1}
            </div>

            {/* Input */}
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
              placeholder={placeholder}
              className={`flex-1 min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 text-base sm:text-sm bg-transparent border-0 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 ${theme.inputFocus}`}
            />

            {/* Actions for this item */}
            <div className="flex items-center gap-0.5 shrink-0">
              
              {/* Optional Move to Completed Action */}
              {onMoveToCompleted && item.trim() && (
                <button
                  type="button"
                  title="Mark as done"
                  onClick={() => onMoveToCompleted(index)}
                  className="flex items-center gap-0.5 text-2xs sm:text-xs px-1.5 sm:px-2 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 active:bg-emerald-300 font-bold rounded-lg border border-emerald-300 transition-colors"
                >
                  <Check className="w-3 h-3 text-emerald-700" />
                  <span className="hidden sm:inline">{moveToLabel}</span>
                </button>
              )}

              {/* Move up (hidden on tiny screens if unnecessary) */}
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  title="Move Up"
                  className="p-1 text-slate-400 hover:text-slate-700 active:bg-slate-100 rounded"
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
                  className="p-1 text-slate-400 hover:text-slate-700 active:bg-slate-100 rounded"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Delete item */}
              <button
                type="button"
                onClick={() => removeItem(index)}
                title="Remove item"
                className="p-1 text-slate-400 hover:text-rose-600 active:bg-rose-50 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

            </div>
          </div>
        ))}
      </div>

      {/* Add Item button */}
      <div className="mt-2.5 flex items-center justify-between">
        <button
          type="button"
          onClick={addItem}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${theme.addBtn}`}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Point
        </button>

        <span className="text-2xs text-slate-400">
          Tip: Hit [Enter] for next
        </span>
      </div>

    </div>
  );
}
