import { useMemo, useState } from "react";
import { AVATARS, getLevel, isAvatarUnlocked } from "../lib/avatarLevels";
import "./LevelAvatarPicker.css";

export default function LevelAvatarPicker({
  points = 0,
  selectedAvatarId = "avatar-04",
  onSave,
}) {
  const currentLevel = useMemo(() => getLevel(points), [points]);
  const selectedIsAllowed = AVATARS.some(
    (avatar) => avatar.id === selectedAvatarId && isAvatarUnlocked(avatar, points)
  );
  const fallbackId = AVATARS.find((avatar) => isAvatarUnlocked(avatar, points))?.id || "avatar-04";
  const [draftId, setDraftId] = useState(selectedIsAllowed ? selectedAvatarId : fallbackId);
  const [message, setMessage] = useState("");

  function chooseAvatar(avatar) {
    if (!isAvatarUnlocked(avatar, points)) {
      setMessage(`Bu profil fotoğrafı ${avatar.level} seviyesinde açılır.`);
      return;
    }
    setDraftId(avatar.id);
    setMessage("");
  }

  async function saveAvatar() {
    const avatar = AVATARS.find((item) => item.id === draftId);
    if (!avatar || !isAvatarUnlocked(avatar, points)) return;
    await onSave?.(avatar.id);
    setMessage("Profil fotoğrafın kaydedildi.");
  }

  return (
    <section className="avatar-picker" aria-labelledby="avatar-picker-title">
      <div className="avatar-picker__header">
        <div>
          <p className="avatar-picker__eyebrow">Profil fotoğrafı</p>
          <h2 id="avatar-picker-title">Pati karakterini seç</h2>
          <p>{currentLevel.name} · {Number(points).toLocaleString("tr-TR")} puan</p>
        </div>
        <button className="avatar-picker__save" type="button" onClick={saveAvatar}>
          Kaydet
        </button>
      </div>

      <div className="avatar-picker__grid">
        {AVATARS.map((avatar) => {
          const unlocked = isAvatarUnlocked(avatar, points);
          const selected = draftId === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              className={`avatar-card ${selected ? "is-selected" : ""} ${!unlocked ? "is-locked" : ""}`}
              onClick={() => chooseAvatar(avatar)}
              aria-pressed={selected}
              aria-label={unlocked ? `${avatar.level} profil fotoğrafını seç` : `${avatar.level} seviyesinde açılır`}
            >
              <img src={avatar.src} alt="HaySev profil seçeneği" />
              {!unlocked && <span className="avatar-card__lock" aria-hidden="true">🔒</span>}
              <span className="avatar-card__level">{avatar.level}</span>
              {!unlocked && <span className="avatar-card__points">{avatar.minPoints.toLocaleString("tr-TR")} puan</span>}
              {selected && unlocked && <span className="avatar-card__check" aria-hidden="true">✓</span>}
            </button>
          );
        })}
      </div>

      {message && <p className="avatar-picker__message" role="status">{message}</p>}
    </section>
  );
}
