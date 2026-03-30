'use client';

import { FormEvent, useMemo, useState } from 'react';
import { normalizePlaceTypeId } from './IconSystem';
import { CreatePlaceSubmissionInput, Member, Place, PlaceType } from '@/lib/types';

type SubmissionPayload = Omit<CreatePlaceSubmissionInput, 'sessionId'>;

type Labels = {
  submitPlaceTitle: string;
  submitPlaceDesc: string;
  submitPlaceName: string;
  submitPlaceCoords: string;
  submitPlaceLat: string;
  submitPlaceLng: string;
  submitPlaceMembers: string;
  submitPlaceType: string;
  submitPlaceReason: string;
  submitPlaceReasonHint: string;
  submitPlaceSource: string;
  submitPlaceExtra: string;
  submitPlaceImage: string;
  submitPlaceDuplicateHint: string;
  submitPlaceExactHint: string;
  submitPlaceSubmit: string;
  submitPlaceSuccess: string;
  close: string;
  submitting: string;
};

type Props = {
  open: boolean;
  members: Member[];
  placeTypes: PlaceType[];
  existingPlaces: Place[];
  placeTypeTextMap: Record<string, string>;
  labels: Labels;
  onClose: () => void;
  onSubmit: (input: SubmissionPayload) => Promise<void>;
};

export default function SubmitPlaceForm({
  open,
  members,
  placeTypes,
  existingPlaces,
  placeTypeTextMap,
  labels,
  onClose,
  onSubmit
}: Props) {
  const [placeName, setPlaceName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [placeTypeId, setPlaceTypeId] = useState(placeTypes[0]?.id ?? 'cafe');
  const [relationNote, setRelationNote] = useState('');
  const [sourceLink, setSourceLink] = useState('');
  const [extraNote, setExtraNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const similarPlaces = useMemo(() => {
    const q = placeName.trim().toLowerCase();
    if (!q) return [];
    return existingPlaces
      .filter((place) =>
        [place.englishName, place.koreanName, place.name]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(q))
      )
      .slice(0, 3);
  }, [existingPlaces, placeName]);

  const hasExactMatch = useMemo(() => {
    const q = placeName.trim().toLowerCase();
    if (!q) return false;
    return existingPlaces.some((place) => {
      return [place.englishName, place.koreanName, place.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase() === q);
    });
  }, [existingPlaces, placeName]);

  const toggleMember = (memberId: string) => {
    setMemberIds((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]));
  };

  const resetForm = () => {
    setPlaceName('');
    setLatitude('');
    setLongitude('');
    setMemberIds([]);
    setPlaceTypeId(placeTypes[0]?.id ?? 'cafe');
    setRelationNote('');
    setSourceLink('');
    setExtraNote('');
    setFiles([]);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!placeName.trim()) {
      setError(labels.submitPlaceName);
      return;
    }

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setError(`${labels.submitPlaceCoords}: ${labels.submitPlaceLat} / ${labels.submitPlaceLng}`);
      return;
    }

    if (!memberIds.length) {
      setError(labels.submitPlaceMembers);
      return;
    }

    if (!placeTypeId) {
      setError(labels.submitPlaceType);
      return;
    }

    if (!relationNote.trim()) {
      setError(labels.submitPlaceReason);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        placeName,
        latitude: lat,
        longitude: lng,
        memberIds,
        placeTypeId,
        relationNote,
        sourceLink,
        extraNote,
        files
      });
      setSuccess(labels.submitPlaceSuccess);
      resetForm();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="submit-overlay" role="dialog" aria-modal="true" aria-label={labels.submitPlaceTitle}>
      <div className="submit-sheet paper-panel panel-fade">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="hero-serif text-[30px] leading-none text-[#263223]">{labels.submitPlaceTitle}</h3>
            <p className="mt-2 text-sm text-[#5f7559]">{labels.submitPlaceDesc}</p>
          </div>
          <button type="button" onClick={onClose} className="paper-button-muted">
            {labels.close}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="paper-kicker">{labels.submitPlaceName}</label>
            <input
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              className="paper-input mt-1 w-full px-3 py-2 text-sm"
            />
          </div>

          {similarPlaces.length ? (
            <div className="submit-duplicate-box">
              <p className="text-xs text-[#476141]">{labels.submitPlaceDuplicateHint}</p>
              <ul className="mt-1 space-y-1 text-xs text-[#62765c]">
                {similarPlaces.map((place) => (
                  <li key={place.id}>• {place.englishName}</li>
                ))}
              </ul>
              {hasExactMatch ? <p className="mt-1 text-xs text-[#8a5b1c]">{labels.submitPlaceExactHint}</p> : null}
            </div>
          ) : null}

          <div>
            <label className="paper-kicker">{labels.submitPlaceCoords}</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <input
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder={labels.submitPlaceLat}
                className="paper-input w-full px-3 py-2 text-sm"
              />
              <input
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder={labels.submitPlaceLng}
                className="paper-input w-full px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="paper-kicker">{labels.submitPlaceMembers}</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {members.map((member) => {
                const active = memberIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    className={`sticker-filter ${active ? 'active' : ''}`}
                  >
                    {member.displayName}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="paper-kicker">{labels.submitPlaceType}</label>
            <select
              value={placeTypeId}
              onChange={(e) => setPlaceTypeId(e.target.value)}
              className="paper-input mt-1 w-full px-3 py-2 text-sm"
            >
              {placeTypes.map((type) => {
                const normalizedId = normalizePlaceTypeId(type.id);
                return (
                  <option key={type.id} value={type.id}>
                    {placeTypeTextMap[normalizedId] ?? type.label}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="paper-kicker">{labels.submitPlaceReason}</label>
            <textarea
              value={relationNote}
              onChange={(e) => setRelationNote(e.target.value.slice(0, 240))}
              placeholder={labels.submitPlaceReasonHint}
              rows={3}
              className="paper-input mt-1 w-full px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="paper-kicker">{labels.submitPlaceSource}</label>
            <input
              value={sourceLink}
              onChange={(e) => setSourceLink(e.target.value)}
              className="paper-input mt-1 w-full px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="paper-kicker">{labels.submitPlaceExtra}</label>
            <textarea
              value={extraNote}
              onChange={(e) => setExtraNote(e.target.value.slice(0, 240))}
              rows={2}
              className="paper-input mt-1 w-full px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="paper-kicker">{labels.submitPlaceImage}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="paper-input mt-1 block w-full p-2 text-xs"
            />
          </div>

          {error ? <p className="text-xs text-[#9c3b3b]">{error}</p> : null}
          {success ? <p className="text-xs text-[#3b6f2f]">{success}</p> : null}

          <div className="pt-1">
            <button type="submit" disabled={loading} className="paper-button-primary">
              {loading ? labels.submitting : labels.submitPlaceSubmit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
