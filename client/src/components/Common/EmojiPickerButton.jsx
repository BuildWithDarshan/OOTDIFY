import { useState } from "react";
import { Smile } from "lucide-react";

const EMOJIS = [
    "😀", "😍", "🥰", "😎", "✨", "🔥",
    "💖", "🤍", "💚", "💫", "👏", "🙌",
    "😊", "😉", "🥹", "🌸", "🌿", "☀️",
    "👗", "👠", "👜", "👟", "🧥", "💯",
];

const EmojiPickerButton = ({ inputRef, maxLength, onChange, value }) => {
    const [open, setOpen] = useState(false);

    const insertEmoji = (emoji) => {
        const input = inputRef.current;
        const start = input?.selectionStart ?? value.length;
        const end = input?.selectionEnd ?? start;
        const nextValue =
            value.slice(0, start) + emoji + value.slice(end);

        if (nextValue.length > maxLength) return;

        onChange(nextValue);
        requestAnimationFrame(() => {
            input?.focus();
            input?.setSelectionRange(start + emoji.length, start + emoji.length);
        });
    };

    return (
        <span className="relative hidden sm:inline-flex">
            <button
                type="button"
                aria-label="Add emoji"
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    open
                        ? "bg-accent text-on-accent"
                        : "bg-accent-subtle text-accent-hover hover:bg-accent hover:text-on-accent"
                }`}
            >
                <Smile aria-hidden="true" className="h-4 w-4" />
            </button>
            {open && (
                <div
                    aria-label="Choose an emoji"
                    className="absolute bottom-full left-0 z-50 mb-2 grid w-52 grid-cols-6 gap-1 rounded-xl border border-border bg-bg p-2 shadow-[0_12px_32px_rgba(8,28,21,0.18)]"
                >
                    {EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            aria-label={`Insert ${emoji}`}
                            onClick={() => {
                                insertEmoji(emoji);
                                setOpen(false);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </span>
    );
};

export default EmojiPickerButton;
