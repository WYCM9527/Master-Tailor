import { useId, useRef, useState } from 'react';
import type {
  BgSetting,
  ColorParam,
  EffectMeta,
  ImageParam,
  ImagesParam,
  Param,
  ParamValue,
  RangeParam,
  SelectParam,
  SlideItem,
  TextParam,
  Values,
} from '../contract/types';
import { BG_DARK, BG_LIGHT, bgColor } from '../contract/types';
import { FONTS } from '../contract/fonts';
import { SAMPLE_IMAGES } from '../contract/samples';
import { applyPreset, defaultValues } from '../engine/urlState';

interface PanelProps {
  meta: EffectMeta;
  values: Values;
  onChange: (values: Values) => void;
  bg: BgSetting;
  onBgChange: (bg: BgSetting) => void;
  /** 让预览舞台进入全屏 */
  onFullscreen: () => void;
}

export function ParamPanel({ meta, values, onChange, bg, onBgChange, onFullscreen }: PanelProps) {
  const setValue = (key: string, v: ParamValue) => onChange({ ...values, [key]: v });

  const isPresetActive = (presetId: string) => {
    const presetValues = applyPreset(meta, presetId);
    // JSON 比较：images 参数的值是对象数组，引用比较永远不等
    return meta.params.every(
      (p) => JSON.stringify(values[p.key] ?? p.default) === JSON.stringify(presetValues[p.key]),
    );
  };

  return (
    <aside className="params" aria-label="参数">
      <div className="blk-head">
        <span className="blk-title">
          参数
          <span className="hint mono">实时进入预览、Prompt 和代码</span>
        </span>
        <div className="blk-actions">
          <button type="button" className="btn" onClick={onFullscreen}>
            全屏预览
          </button>
          <button
            type="button"
            className="btn"
            title="恢复全部参数为默认值"
            onClick={() => onChange(defaultValues(meta))}
          >
            重置
          </button>
        </div>
      </div>
      <div className="params-body">
        <BgControl bg={bg} onChange={onBgChange} />

        <div className="control">
          <div className="control-head">
            <span className="control-label">预设</span>
            <span className="control-value">{meta.presets.length} 组</span>
          </div>
          <div className="tag-row">
            {meta.presets.map((preset) => (
              <button
                type="button"
                key={preset.id}
                className={`tag${isPresetActive(preset.id) ? ' active' : ''}`}
                onClick={() => onChange(applyPreset(meta, preset.id))}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {meta.params.map((param) => (
          <Control
            key={param.key}
            param={param}
            value={values[param.key] ?? param.default}
            onChange={(v) => setValue(param.key, v)}
          />
        ))}
      </div>
    </aside>
  );
}

/** 自定义底色的方形斜纹示意（不用彩色渐变） */
const HATCH = 'repeating-linear-gradient(45deg, #fff 0 2px, #000 2px 5px)';

/** 预览底色：深 / 浅 / 自定义，只影响预览与导出代码的页面底色 */
function BgControl({ bg, onChange }: { bg: BgSetting; onChange: (bg: BgSetting) => void }) {
  const customColor = bg.mode === 'custom' ? bg.color : '#22335c';
  return (
    <div className="control">
      <div className="control-head">
        <span className="control-label">预览底色</span>
        <span className="control-value">{bgColor(bg)}</span>
      </div>
      <div className="bg-row">
        <button
          type="button"
          className={`swatch${bg.mode === 'dark' ? ' active' : ''}`}
          style={{ background: BG_DARK }}
          title="深色底"
          aria-label="深色底"
          onClick={() => onChange({ mode: 'dark' })}
        />
        <button
          type="button"
          className={`swatch${bg.mode === 'light' ? ' active' : ''}`}
          style={{ background: BG_LIGHT }}
          title="浅色底"
          aria-label="浅色底"
          onClick={() => onChange({ mode: 'light' })}
        />
        <span
          className={`swatch${bg.mode === 'custom' ? ' active' : ''}`}
          style={{ background: bg.mode === 'custom' ? customColor : HATCH }}
          title="自定义底色"
        >
          <input
            type="color"
            value={customColor}
            onChange={(e) => onChange({ mode: 'custom', color: e.target.value })}
            aria-label="自定义预览底色"
          />
        </span>
        <span className="bg-names mono">深 / 浅 / 自定义</span>
      </div>
      <span className="control-help">只影响预览与导出代码的页面底色，不写进 prompt。</span>
    </div>
  );
}

interface ControlProps {
  param: Param;
  value: ParamValue;
  onChange: (v: ParamValue) => void;
}

function Control({ param, value, onChange }: ControlProps) {
  switch (param.type) {
    case 'color':
      return <ColorControl param={param} value={String(value)} onChange={onChange} />;
    case 'range':
      return <RangeControl param={param} value={Number(value)} onChange={onChange} />;
    case 'toggle':
      return (
        <div className="control">
          <label className="control-head" style={{ cursor: 'pointer', marginBottom: 0 }}>
            <span className="control-label">{param.label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(value)}
              aria-label={param.label}
              className={`toggle${value ? ' on' : ''}`}
              onClick={() => onChange(!value)}
            />
          </label>
          {param.help && <span className="control-help">{param.help}</span>}
        </div>
      );
    case 'select':
      return <SelectControl param={param} value={String(value)} onChange={onChange} />;
    case 'text':
      return <TextControl param={param} value={String(value)} onChange={onChange} />;
    case 'font':
      return (
        <div className="control">
          <span className="control-label">{param.label}</span>
          <select value={String(value)} onChange={(e) => onChange(e.target.value)}>
            {FONTS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          {param.help && <span className="control-help">{param.help}</span>}
        </div>
      );
    case 'image':
      return <ImageControl param={param} value={String(value)} onChange={onChange} />;
    case 'images':
      return <ImagesControl param={param} value={value as SlideItem[]} onChange={onChange} />;
  }
}

function ColorControl({
  param,
  value,
  onChange,
}: {
  param: ColorParam;
  value: string;
  onChange: (v: ParamValue) => void;
}) {
  return (
    <div className="control">
      <div className="control-head">
        <span className="control-label">{param.label}</span>
        <span className="control-value">{value}</span>
      </div>
      <div className="color-control">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={param.label}
        />
        <input
          type="text"
          value={value}
          maxLength={7}
          onChange={(e) => {
            const v = e.target.value.trim();
            if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v.toLowerCase());
          }}
          aria-label={`${param.label} hex 值`}
        />
      </div>
      {param.help && <span className="control-help">{param.help}</span>}
    </div>
  );
}

function RangeControl({
  param,
  value,
  onChange,
}: {
  param: RangeParam;
  value: number;
  onChange: (v: ParamValue) => void;
}) {
  const unit = param.displayUnit ?? param.unit ?? '';
  return (
    <div className="control">
      <div className="control-head">
        <span className="control-label">{param.label}</span>
        <span className="control-value">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={param.min}
        max={param.max}
        step={param.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={param.label}
      />
      {param.help && <span className="control-help">{param.help}</span>}
    </div>
  );
}

function SelectControl({
  param,
  value,
  onChange,
}: {
  param: SelectParam;
  value: string;
  onChange: (v: ParamValue) => void;
}) {
  return (
    <div className="control">
      <span className="control-label">{param.label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {param.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {param.help && <span className="control-help">{param.help}</span>}
    </div>
  );
}

function TextControl({
  param,
  value,
  onChange,
}: {
  param: TextParam;
  value: string;
  onChange: (v: ParamValue) => void;
}) {
  return (
    <div className="control">
      <span className="control-label">{param.label}</span>
      <input
        type="text"
        value={value}
        maxLength={param.maxLength ?? 120}
        onChange={(e) => onChange(e.target.value)}
        aria-label={param.label}
      />
      {param.help && <span className="control-help">{param.help}</span>}
    </div>
  );
}

/**
 * 图片列表控件（轮播等多图效果）：
 * 每个槽位 = 当前图缩略 + 标题输入 + 删除；点击缩略图展开示例图选择与上传。
 */
function ImagesControl({
  param,
  value,
  onChange,
}: {
  param: ImagesParam;
  value: SlideItem[];
  onChange: (v: ParamValue) => void;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const fileInputId = useId();

  const update = (index: number, patch: Partial<SlideItem>) => {
    onChange(value.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };
  const remove = (index: number) => {
    setExpanded(null);
    onChange(value.filter((_, i) => i !== index));
  };
  const add = () => {
    // 新槽位轮流取示例图，避免连续同图
    const src = SAMPLE_IMAGES[value.length % SAMPLE_IMAGES.length];
    onChange([...value, { src, caption: '' }]);
  };
  const onUpload = (index: number, file: File | undefined) => {
    if (!file) return;
    update(index, { src: URL.createObjectURL(file) });
    setExpanded(null);
  };

  return (
    <div className="control">
      <div className="control-head">
        <span className="control-label">{param.label}</span>
        <span className="control-value">
          {value.length} / {param.max} 张
        </span>
      </div>
      <div className="slides-list">
        {value.map((slide, i) => (
          <div className="slide-slot" key={i}>
            <div className="slide-slot-row">
              <button
                type="button"
                className="image-option slide-thumb"
                title="更换这张图"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <img src={slide.src} alt={`第 ${i + 1} 张`} />
              </button>
              {param.captions ? (
                <input
                  type="text"
                  value={slide.caption}
                  maxLength={30}
                  placeholder={`第 ${i + 1} 张的标题（可留空）`}
                  onChange={(e) => update(i, { caption: e.target.value })}
                  aria-label={`第 ${i + 1} 张的标题`}
                />
              ) : (
                <span className="muted slide-noc">第 {i + 1} 张</span>
              )}
              <button
                type="button"
                className="btn btn-ghost slide-remove"
                disabled={value.length <= param.min}
                title={value.length <= param.min ? `至少 ${param.min} 张` : '删除这张'}
                onClick={() => remove(i)}
              >
                ×
              </button>
            </div>
            {expanded === i && (
              <div className="image-options slide-picker">
                {SAMPLE_IMAGES.map((src, si) => (
                  <button
                    type="button"
                    key={src}
                    className={`image-option${slide.src === src ? ' active' : ''}`}
                    onClick={() => {
                      update(i, { src });
                      setExpanded(null);
                    }}
                    title={`示例图 ${si + 1}`}
                  >
                    <img src={src} alt={`示例图 ${si + 1}`} />
                  </button>
                ))}
                <label
                  className="image-upload"
                  htmlFor={`${fileInputId}-${i}`}
                  title="上传自己的图片（仅本地预览）"
                >
                  +
                  <input
                    id={`${fileInputId}-${i}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => onUpload(i, e.target.files?.[0])}
                  />
                </label>
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          className="btn btn-ghost slide-add"
          disabled={value.length >= param.max}
          onClick={add}
        >
          添加一张
        </button>
      </div>
      <span className="control-help">
        上传的图片只在你的浏览器里预览；导出代码与 prompt 会写占位路径 ./slide-1.jpg …。
        {param.help ? ` ${param.help}` : ''}
      </span>
    </div>
  );
}

function ImageControl({
  param,
  value,
  onChange,
}: {
  param: ImageParam;
  value: string;
  onChange: (v: ParamValue) => void;
}) {
  const inputId = useId();
  const lastObjectUrl = useRef<string | null>(null);

  const onUpload = (file: File | undefined) => {
    if (!file) return;
    if (lastObjectUrl.current) URL.revokeObjectURL(lastObjectUrl.current);
    const url = URL.createObjectURL(file);
    lastObjectUrl.current = url;
    onChange(url);
  };

  return (
    <div className="control">
      <span className="control-label">{param.label}</span>
      <div className="image-options">
        {SAMPLE_IMAGES.map((src, i) => (
          <button
            type="button"
            key={src}
            className={`image-option${value === src ? ' active' : ''}`}
            onClick={() => onChange(src)}
            title={`示例图 ${i + 1}`}
          >
            <img src={src} alt={`示例图 ${i + 1}`} />
          </button>
        ))}
        <label className="image-upload" htmlFor={inputId} title="上传自己的图片（仅本地预览）">
          +
          <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
        </label>
      </div>
      <span className="control-help">
        上传的图片只在你的浏览器里预览，不会上传到任何服务器；导出代码与 prompt 会写占位路径
        ./your-image.jpg。
      </span>
    </div>
  );
}
