import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';

interface StickerPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onStickerSelect: (sticker: string) => void;
}

const stickerCategories = {
  emotions: {
    name: "Emotions 😊",
    stickers: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐"]
  },
  animals: {
    name: "Animals 🐶",
    stickers: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷", "🕸", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐓", "🦃", "🦚", "🦜", "🦢", "🦩", "🕊", "🐇", "🦝", "🦨", "🦡", "🦦", "🦥", "🐁", "🐀", "🐿", "🦔"]
  },
  food: {
    name: "Food 🍕",
    stickers: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕", "🫓", "🥪", "🥙", "🧆", "🌮", "🌯", "🫔", "🥗", "🥘", "🫕", "🥫", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥮", "🍢", "🍡", "🍧", "🍨", "🍦", "🥧", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥜", "🍯"]
  },
  activities: {
    name: "Activities ⚽",
    stickers: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛷", "⛸", "🥌", "🎿", "⛷", "🏂", "🪂", "🏋️‍♀️", "🏋️", "🏋️‍♂️", "🤼‍♀️", "🤼", "🤼‍♂️", "🤸‍♀️", "🤸", "🤸‍♂️", "⛹️‍♀️", "⛹️", "⛹️‍♂️", "🤺", "🤾‍♀️", "🤾", "🤾‍♂️", "🏌️‍♀️", "🏌️", "🏌️‍♂️", "🏇", "🧘‍♀️", "🧘", "🧘‍♂️", "🏄‍♀️", "🏄", "🏄‍♂️", "🏊‍♀️", "🏊", "🏊‍♂️", "🤽‍♀️", "🤽", "🤽‍♂️", "🚣‍♀️", "🚣", "🚣‍♂️", "🧗‍♀️", "🧗", "🧗‍♂️", "🚵‍♀️", "🚵", "🚵‍♂️", "🚴‍♀️", "🚴", "🚴‍♂️", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖", "🏵", "🎗", "🎫", "🎟", "🎪", "🤹‍♀️", "🤹", "🤹‍♂️", "🎭", "🩰", "🎨", "🎬", "🎤", "🎧", "🎼", "🎵", "🎶", "🥁", "🪘", "🎹", "🎷", "🎺", "🪗", "🎸", "🪕", "🎻", "🎲", "♟", "🎯", "🎳", "🎮", "🎰", "🧩"]
  },
  nature: {
    name: "Nature 🌸",
    stickers: ["🌸", "💮", "🏵", "🌹", "🥀", "🌺", "🌻", "🌼", "🌷", "🌱", "🪴", "🌲", "🌳", "🌴", "🌵", "🌶", "🌾", "🌿", "☘", "🍀", "🍁", "🍂", "🍃", "🪹", "🪺", "🍄", "🌰", "🐚", "🪨", "🌍", "🌎", "🌏", "🌐", "🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘", "🌙", "🌚", "🌛", "🌜", "☀", "🌝", "🌞", "🪐", "⭐", "🌟", "🌠", "🌌", "☁", "⛅", "⛈", "🌤", "🌦", "🌧", "⛆", "🌩", "🌨", "❄", "☃", "⛄", "🌬", "💨", "💧", "💦", "☔", "☂", "🌊", "🌈"]
  },
  objects: {
    name: "Objects 💎",
    stickers: ["💎", "🔮", "💍", "💄", "👑", "🎩", "🎓", "👒", "🧢", "⛑", "📿", "💼", "🎒", "👝", "👛", "👜", "💰", "🪙", "💴", "💵", "💶", "💷", "💸", "💳", "🧾", "💹", "✉", "📧", "📨", "📩", "📤", "📥", "📦", "📫", "📪", "📬", "📭", "📮", "🗳", "✏", "✒", "🖋", "🖊", "🖌", "🖍", "📝", "💼", "📁", "📂", "🗂", "📅", "📆", "🗒", "🗓", "📇", "📈", "📉", "📊", "📋", "📌", "📍", "📎", "🖇", "📏", "📐", "✂", "🗃", "🗄", "🗑", "🔒", "🔓", "🔏", "🔐", "🔑", "🗝", "🔨", "🪓", "⛏", "⚒", "🛠", "🗡", "⚔", "🔫", "🪃", "🏹", "🛡", "🪚", "🔧", "🪛", "🔩", "⚙", "🗜", "⚖", "🦯", "🔗", "⛓", "🪝", "🧰", "🧲", "🪜", "⚗", "🧪", "🧫", "🧬", "🔬", "🔭", "📡"]
  }
};

export function StickerPicker({ isOpen, onClose, onStickerSelect }: StickerPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState('emotions');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStickers = searchTerm
    ? Object.values(stickerCategories)
        .flatMap(category => category.stickers)
        .filter(sticker => 
          sticker.includes(searchTerm) || 
          Object.entries(stickerCategories).some(([key, category]) => 
            category.stickers.includes(sticker) && 
            (key.includes(searchTerm.toLowerCase()) || category.name.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        )
    : stickerCategories[selectedCategory as keyof typeof stickerCategories].stickers;

  const handleStickerClick = (sticker: string) => {
    onStickerSelect(sticker);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md mx-4 mb-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 300, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              Choose a Sticker ✨
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search stickers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Categories */}
          {!searchTerm && (
            <div className="flex overflow-x-auto p-2 border-b border-slate-200 dark:border-slate-700">
              {Object.entries(stickerCategories).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`flex-shrink-0 px-3 py-2 mx-1 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === key
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* Stickers Grid */}
          <div className="h-64 overflow-y-auto p-4">
            <div className="grid grid-cols-8 gap-2">
              {filteredStickers.map((sticker, index) => (
                <motion.button
                  key={`${sticker}-${index}`}
                  onClick={() => handleStickerClick(sticker)}
                  className="aspect-square flex items-center justify-center text-2xl rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                >
                  {sticker}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}