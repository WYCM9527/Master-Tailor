import { useId, useRef } from 'react';
import type {
  ColorParam,
  EffectMeta,
  ImageParam,
  Param,
  ParamValue,
  RangeParam,
  SelectParam,
  TextParam,
  Values,
} from '../contract/types';
import { FONTS } from '../contract/fonts';
import { applyPreset, defaultValues } from '../engine/urlState';

/** 站内示例图（public/samples/，也是图片参数在分享链接里唯一允许的取值） */
export const SAMPLE_IMAGES = ['/samples/sample-1.svg', '/samples/sample-2.svg', '/samples/sample-3.svg'];

interface PanelProps {
  meta: EffectMeta;
  values: Values;
  onChange: (values: Values) => void;
}

export function ParamPanel({ meta, values, onChange }: PanelProps) {
  const setValue = (key: string, v: ParamValue) => onChange({ ...values, [key]: v });

  const isPresetActive = (presetId: string) => {
    const presetValues = applyPreset(meta, presetId);
    return meta.params.every((p) => (values[p.key] ?? p.default) === presetValues[p.key]);
  };

  return (
    <aside className="param-panel glass">
      <div className="block-head">
        <span className="block-title">
          参数
          <span className="hint">调整会实时进入预览、prompt 和代码</span>
        </span>
      </div>
      <div className="block-body">
        <div className="control">
          <span className="control-label">预设</span>
          <div className="preset-row">
            {meta.presets.map((preset) => (
              <button
                type="button"
                key={preset.id}
                className={`chip${isPresetActive(preset.id) ? ' active' : ''}`}
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

        <div className="panel-footer">
          <button type="button" className="btn btn-ghost" onClick={() => onChange(defaultValues(meta))}>
            重置参数
          </button>
        </div>
      </div>
    </aside>
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
          <label className="switch-row control-head" style={{ cursor: 'pointer' }}>
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
        ./your-image.jpg，分享链接不包含上传的图片。
      </span>
    </div>
  );
}
