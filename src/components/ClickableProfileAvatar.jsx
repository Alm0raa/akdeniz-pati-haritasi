import { useMemo, useState } from "react";
import LevelAvatarPicker from "./LevelAvatarPicker";
import { AVATARS } from "../lib/avatarLevels";
import "./ClickableProfileAvatar.css";

export default function ClickableProfileAvatar({
  points = 0,
  selectedAvatarId = "avatar-04",
  onSave,
  size = 112,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedAvatar = useMemo(
    () => AVATARS.find((avatar) => avatar.id === selectedAvatarId) || AVATARS[0],
    [selectedAvatarId]
  );

  async function handleSave(avatarId) {
    await onSave?.(avatarId);
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="clickable-avatar"
        style={{ width: size, height: size }}
        onClick={() => setIsOpen(true)}
        aria-label="Profil fotoğrafını değiştir"
      >
        <img src={selectedAvatar.src} alt="Seçili profil fotoğrafı" />
        <span className="clickable-avatar__edit" aria-hidden="true">✎</span>
      </button>

      {isOpen && (
        <div
          className="avatar-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Profil fotoğrafı seçimi"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <div className="avatar-modal__panel">
            <button
              type="button"
              className="avatar-modal__close"
              onClick={() => setIsOpen(false)}
              aria-label="Kapat"
            >
              ×
            </button>

            <LevelAvatarPicker
              points={points}
              selectedAvatarId={selectedAvatarId}
              onSave={handleSave}
            />
          </div>
        </div>
      )}
    </>
  );
}
