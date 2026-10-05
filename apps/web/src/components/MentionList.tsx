import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export const MentionList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: item.display, username: item.username, displayName: item.displayName });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  if (!props.items.length) {
    return (
      <div className="bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#3A3B3C] rounded-lg shadow-xl p-3 text-sm text-gray-500">
        No result
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#3A3B3C] rounded-lg shadow-xl py-2 min-w-[240px] max-h-[250px] overflow-y-auto z-50">
      {props.items.map((item: any, index: number) => (
        <button
          className={`flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] transition-colors ${index === selectedIndex ? 'bg-gray-100 dark:bg-[#3A3B3C]' : ''
            }`}
          key={index}
          onClick={() => selectItem(index)}
        >
          <img src={item.avatarUrl || "/default-avatar.svg"} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              {item.displayName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              @{item.display}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
});

MentionList.displayName = 'MentionList';
