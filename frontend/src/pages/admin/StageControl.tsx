import React, { useState } from 'react';
import { ExternalLinkIcon, RadioIcon } from 'lucide-react';
import { useEvent } from '../../contexts/EventContext';
import { DisplayMode } from '../../types/event';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { Toggle } from '../../components/ui/Field';
import { ConfirmModal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/Status';
import { TechLabel } from '../../components/ui/TechScreen';
import { StagePreview } from '../../components/admin/StagePreview';
import { useToast } from '../../components/ui/Toast';

const MODES: {id: DisplayMode;label: string;note: string;}[] = [
{ id: 'branding', label: 'هوية الحدث', note: 'اللوجو، اسم الحدث، الرعاة' },
{ id: 'starting', label: 'بدء الحدث', note: 'تفضلوا بالجلوس' },
{ id: 'voting_live', label: 'التصويت المباشر', note: 'امسح الباركود وصوت' },
{ id: 'audience', label: 'نتائج الجمهور', note: 'نقاط 1-2-3' },
{ id: 'judges', label: 'نتائج الحكام', note: 'تقييم 1-5' },
{ id: 'combined', label: 'النتائج المجمعة', note: 'النسبة 60/40' },
{ id: 'hidden', label: 'النتائج مخفية', note: 'إيقاف الشاشة' },
{ id: 'final_ready', label: 'النتائج النهائية جاهزة', note: 'في وضع الانتظار' },
{ id: 'finished', label: 'نهاية الحدث', note: 'شاشة الشكر' }];


export function StageControl() {
  const { display, setDisplayMode, setDisplayPower, publishWinner, results } =
  useEvent();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Panel
        label="شاشة العرض · معاينة مباشرة"
        index="G1"
        action={
        <StatusBadge tone={display.power ? 'live' : 'off'} blink={display.power}>
            {display.power ? 'الشاشة متصلة' : 'الشاشة مخفية'}
          </StatusBadge>
        }
        bodyClassName="px-4 py-4">
        
        <StagePreview />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <TechLabel>1920 × 1080 · 16:9 output · mirrored live</TechLabel>
          <a
            href="https://display-screen-minders.vercel.app/"
            target="display_window"
            rel="noreferrer"
            onClick={(e) => {
              e.preventDefault();
              const win = window.open('https://display-screen-minders.vercel.app/', 'display_window');
              if (win) (window as any).__DISPLAY_WINDOW__ = win;
            }}>
            <Button
              variant="outline"
              size="sm"
              icon={<ExternalLinkIcon className="h-4 w-4" strokeWidth={2} />}>
              
              Open on projector
            </Button>
          </a>
        </div>
      </Panel>

      <div className="space-y-6">
        <Panel label="المخرج الرئيسي" index="G2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <TechLabel>Display power</TechLabel>
              <div className="mt-1 text-lg font-extrabold text-fg">
                {display.power ? 'على الهواء' : 'شاشة سوداء'}
              </div>
            </div>
            <Toggle
              checked={display.power}
              onChange={(v) => {
                setDisplayPower(v);
                toast(v ? 'Display started' : 'Display stopped');
              }}
              label="طاقة الشاشة" />
            
          </div>
        </Panel>

        <Panel label="اختيار المشهد" index="G3">
          <ul className="space-y-2">
            {MODES.map((m) => {
              const active = display.mode === m.id;
              return (
                <li key={m.id}>
                  <button
                    onClick={() => {
                      setDisplayMode(m.id);
                      toast(`Stage scene: ${m.label}`);
                    }}
                    className={`flex w-full items-center gap-3 rounded-sm border px-3.5 py-3 text-left transition-colors duration-150 ease-mech ${
                    active ?
                    'border-brand/60 bg-brand/10' :
                    'border-line bg-ink-950 hover:bg-ink-850'}`
                    }>
                    
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      active ? 'bg-brand shadow-led' : 'bg-ink-600'}`
                      } />
                    
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm font-extrabold ${
                        active ? 'text-brand' : 'text-fg'}`
                        }>
                        
                        {m.label}
                      </span>
                      <span className="block truncate text-[11px] font-semibold text-fg-dim">
                        {m.note}
                      </span>
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-tech ${
                      active ? 'text-brand' : 'text-ink-600'}`
                      }>
                      
                      {active ? 'على الهواء' : 'إظهار المشهد'}
                    </span>
                  </button>
                </li>);

            })}
          </ul>
        </Panel>

        <Panel label="إعلان الفائز" index="G4">
          <p className="text-xs font-semibold leading-relaxed text-fg-muted">
            Locked behind confirmation. Takes over the full screen with the
            ceremony reveal.
          </p>
          <Button
            size="lg"
            block
            className="mt-4"
            icon={<RadioIcon className="h-4 w-4" strokeWidth={2.5} />}
            onClick={() => setConfirm(true)}>
            
            Publish Winner
          </Button>
        </Panel>
      </div>

      <ConfirmModal
        open={confirm}
        title="هل تريد عرض الفائز على الشاشة الرئيسية؟"
        body={`${results[0]?.team.name} will be announced at ${results[0]?.finalPct.toFixed(1)} pts. This replaces whatever is currently on air.`}
        confirmLabel="نعم، أعلن الفائز"
        destructive={false}
        onConfirm={() => {
          publishWinner();
          toast('Winner reveal on air', 'ok');
        }}
        onClose={() => setConfirm(false)} />
      
    </div>);

}