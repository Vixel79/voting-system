import React from 'react';
import { useEvent } from '../../contexts/EventContext';
import { Panel } from '../../components/ui/Panel';
import { Input } from '../../components/ui/Field';
import { Meter } from '../../components/ui/Meter';
import { TechLabel } from '../../components/ui/TechScreen';

export function EventSettings() {
  const { settings, updateSettings } = useEvent();

  const setWeight = (judges: number) => {
    const j = Math.max(0, Math.min(100, judges));
    updateSettings({ judgesWeight: j, audienceWeight: 100 - j });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Panel label="Event identity" index="I1">
        <div className="grid gap-4">
          <Input
            label="Event name"
            value={settings.eventName}
            onChange={(e) => updateSettings({ eventName: e.target.value })} />
          
          <Input
            label="Event name (Arabic)"
            value={settings.eventNameAr}
            onChange={(e) => updateSettings({ eventNameAr: e.target.value })}
            dir="rtl" />
          
          <Input
            label="Round label"
            value={settings.round}
            onChange={(e) => updateSettings({ round: e.target.value })} />
          
          <Input
            label="مكان الحدث"
            value={settings.venue}
            onChange={(e) => updateSettings({ venue: e.target.value })} />
          
        </div>
      </Panel>

      <Panel label="Scoring weights" index="I2">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Judges weight (%)"
            type="number"
            min={0}
            max={100}
            value={settings.judgesWeight}
            onChange={(e) => setWeight(Number(e.target.value))} />
          
          <Input
            label="Audience weight (%)"
            value={settings.audienceWeight}
            readOnly
            hint="Derived automatically" />
          
        </div>
        <div className="mt-5">
          <TechLabel>Weight split</TechLabel>
          <div className="mt-2">
            <Meter value={settings.judgesWeight} segmented />
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-extrabold uppercase tracking-tech">
            <span className="text-brand">Judges {settings.judgesWeight}%</span>
            <span className="text-fg-dim">
              Audience {settings.audienceWeight}%
            </span>
          </div>
        </div>
        <div className="mt-6 border-t border-line pt-5">
          <Input
            label="مدة التصويت (ثواني)"
            type="number"
            min={10}
            max={900}
            value={settings.votingDuration}
            onChange={(e) =>
            updateSettings({ votingDuration: Number(e.target.value) })
            }
            hint="Applied on the next timer reset" />
          
        </div>
      </Panel>

      <Panel label="Post-voting audience screen" index="I3">
        <div className="grid gap-4">
          <Input
            label="Headline"
            value={settings.postVotingHeadline}
            onChange={(e) =>
            updateSettings({ postVotingHeadline: e.target.value })
            } />
          
          <div>
            <label
              htmlFor="post-body"
              className="mb-2 block text-[10px] font-extrabold uppercase tracking-tech text-fg-muted">
              
              Body copy
            </label>
            <textarea
              id="post-body"
              rows={4}
              value={settings.postVotingBody}
              onChange={(e) => updateSettings({ postVotingBody: e.target.value })}
              className="w-full rounded-sm border border-line-strong bg-ink-950 px-3.5 py-3 text-sm font-semibold text-fg shadow-pressed outline-none focus:border-brand" />
            
          </div>
        </div>
      </Panel>

      <Panel label="Sponsors" index="I4">
        <div className="grid gap-3 sm:grid-cols-2">
          {settings.sponsors.map((s, i) =>
          <Input
            key={i}
            label={`Slot 0${i + 1}`}
            value={s}
            onChange={(e) => {
              const next = [...settings.sponsors];
              next[i] = e.target.value;
              updateSettings({ sponsors: next });
            }} />

          )}
        </div>
        <p className="mt-4 text-xs font-semibold text-fg-dim">
          Sponsor slots appear on the branding stage scene and the post-voting
          audience screen.
        </p>
      </Panel>
    </div>);

}