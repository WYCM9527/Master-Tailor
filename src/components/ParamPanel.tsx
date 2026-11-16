import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type {
  BgSetting,
  ColorParam,
  ColorsParam,
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
import { IconClose, IconParams, IconPlus } from './Icons';
import { SAMPLE_IMAGES } from '../contract/samples';
import { withBase } from '../contract/base';
import { applyPreset, defaultValues } from '../engine/urlState';
import {
  LIST_SEP,
  cleanField,
  fieldPadding,
  fieldSepOf,
  isListText,
  joinFields,
  splitFields,
} from '../engine/textList';

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
          <IconParams />
          参数
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
      return isListText(param) ? (
        <TextListControl param={param} value={String(value)} onChange={onChange} />
      ) : (
        <TextControl param={param} value={String(value)} onChange={onChange} />
      );
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
    case 'colors':
      return <ColorsControl param={param} value={value as string[]} onChange={onChange} />;
  }
}

/** 颜色列表控件：每行 = 色块选择器 + hex 输入 + 删除，可在 [min, max] 内增减 */
function ColorsControl({
  param,
  value,
  onChange,
}: {
  param: ColorsParam;
  value: string[];
  onChange: (v: ParamValue) => void;
}) {
  const update = (index: number, color: string) => {
    onChange(value.map((c, i) => (i === index ? color : c)));
  };
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));
  // 新颜色从默认调色板轮流取，用完后复用最后一色，避免连续同色
  const add = () => {
    const fallback =
      param.default[value.length % param.default.length] ?? value.at(-1) ?? '#ffffff';
    onChange([...value, fallback]);
  };

  return (
    <div className="control">
      <div className="control-head">
        <span className="control-label">{param.label}</span>
        <span className="control-value">
          {value.length} / {param.max} 色
        </span>
      </div>
      <div className="slides-list">
        {value.map((color, i) => (
          <div className="slide-slot" key={i}>
            <div className="slide-slot-row color-slot-row">
              <input
                type="color"
                value={color}
                onChange={(e) => update(i, e.target.value)}
                aria-label={`第 ${i + 1} 色`}
              />
              <input
                type="text"
                value={color}
                maxLength={7}
                onChange={(e) => {
                  const v = e.target.value.trim();
                  if (/^#[0-9a-fA-F]{6}$/.test(v)) update(i, v.toLowerCase());
                }}
                aria-label={`第 ${i + 1} 色 hex 值`}
              />
              <button
                type="button"
                className="btn btn-ghost slide-remove"
                disabled={value.length <= param.min}
                title={value.length <= param.min ? `至少 ${param.min} 色` : '删除这一色'}
                onClick={() => remove(i)}
              >
                <IconClose size={12} />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-ghost slide-add"
          disabled={value.length >= param.max}
          onClick={add}
        >
          添加一色
        </button>
      </div>
      {param.help && <span className="control-help">{param.help}</span>}
    </div>
  );
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
      <GrowingText
        value={value}
        maxLength={param.maxLength ?? 120}
        onChange={(text) => onChange(text.replace(/\r?\n/g, ' '))}
        aria-label={param.label}
      />
      {param.help && <span className="control-help">{param.help}</span>}
    </div>
  );
}

/**
 * 多项文本控件：默认值含「｜」的文本参数拆成一项一个输入框，可增删；声明了 fields 的再把每项拆成带字段名的小框。
 * 回车在下方插入新项，粘贴多行文本按行拆成多项。值仍按原写法拼回一串，CONFIG / URL / prompt 格式不变。
 */
function TextListControl({
  param,
  value,
  onChange,
}: {
  param: TextParam;
  value: string;
  onChange: (v: ParamValue) => void;
}) {
  const max = param.maxLength ?? 120;
  const items = value.split(LIST_SEP);
  const fieldNames = param.fields;
  const sep = fieldSepOf(param);
  // maxLength 管的是拼接后的整串，每多一项还要多占一个分隔符
  const room = Math.max(0, max - value.length);
  const baseId = useId();
  const firstInputs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const pendingFocus = useRef<number | null>(null);

  useEffect(() => {
    if (pendingFocus.current === null) return;
    firstInputs.current[pendingFocus.current]?.focus();
    pendingFocus.current = null;
  });

  const commit = (next: string[]) => onChange(next.join(LIST_SEP));
  const update = (index: number, text: string) =>
    commit([...items.slice(0, index), ...text.split(/\r?\n/), ...items.slice(index + 1)]);
  const updateField = (index: number, k: number, count: number, text: string) => {
    const values = splitFields(items[index], count, sep);
    values[k] = cleanField(text, sep);
    commit(items.map((item, i) => (i === index ? joinFields(values, sep) : item)));
  };
  const insertAfter = (index: number) => {
    if (room < 1) return;
    pendingFocus.current = index + 1;
    commit([...items.slice(0, index + 1), '', ...items.slice(index + 1)]);
  };
  const remove = (index: number) => commit(items.filter((_, i) => i !== index));

  return (
    <div className="control">
      <div className="control-head">
        <span className="control-label">{param.label}</span>
        <span className="control-value">
          {items.length} 项 · {value.length} / {max} 字
        </span>
      </div>
      <div className="slides-list">
        {items.map((item, i) => (
          <div className="slide-slot" key={i}>
            <div className="slide-slot-row">
              {fieldNames ? (
                <div className="text-fields">
                  {splitFields(item, fieldNames.length, sep).map((field, k, values) => (
                    <Fragment key={k}>
                      <label className="text-field-name" htmlFor={`${baseId}-${i}-${k}`}>
                        {fieldNames[k]}
                      </label>
                      <GrowingText
                        id={`${baseId}-${i}-${k}`}
                        value={field}
                        maxLength={field.length + Math.max(0, room - fieldPadding(values, k))}
                        aria-label={`${param.label}第 ${i + 1} 项的${fieldNames[k]}`}
                        textareaRef={
                          k === 0
                            ? (el) => {
                                firstInputs.current[i] = el;
                              }
                            : undefined
                        }
                        onChange={(text) => updateField(i, k, fieldNames.length, text)}
                        onEnter={() => insertAfter(i)}
                      />
                    </Fragment>
                  ))}
                </div>
              ) : (
                <GrowingText
                  value={item}
                  maxLength={item.length + room}
                  placeholder={`第 ${i + 1} 项`}
                  aria-label={`${param.label}第 ${i + 1} 项`}
                  textareaRef={(el) => {
                    firstInputs.current[i] = el;
                  }}
                  onChange={(text) => update(i, text)}
                  onEnter={() => insertAfter(i)}
                />
              )}
              <button
                type="button"
                className="btn btn-ghost slide-remove"
                disabled={items.length <= 1}
                title={items.length <= 1 ? '至少保留 1 项' : '删除这一项'}
                onClick={() => remove(i)}
              >
                <IconClose size={12} />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-ghost slide-add"
          disabled={room < 1}
          onClick={() => insertAfter(items.length - 1)}
        >
          添加一项
        </button>
      </div>
      {param.help && <span className="control-help">{param.help}</span>}
    </div>
  );
}

const FIELD_SIZING = typeof CSS !== 'undefined' && CSS.supports('field-sizing', 'content');

/** 随内容自动增高的文本框，不允许换行（回车交给 onEnter）；不支持 field-sizing 的浏览器按 scrollHeight 撑高 */
function GrowingText({
  value,
  maxLength,
  onChange,
  onEnter,
  textareaRef,
  ...rest
}: {
  value: string;
  maxLength: number;
  id?: string;
  placeholder?: string;
  'aria-label': string;
  onChange: (text: string) => void;
  onEnter?: () => void;
  textareaRef?: (el: HTMLTextAreaElement | null) => void;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  // 输入法的拼写串会逐次写回值，上限跟着涨就截不住上屏的字，拼写期间停在开始时的上限
  const [composingMax, setComposingMax] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (FIELD_SIZING || !el) return;
    el.style.height = 'auto';
    if (el.scrollHeight)
      el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px`;
  }, [value]);

  return (
    <textarea
      {...rest}
      ref={(el) => {
        ref.current = el;
        textareaRef?.(el);
      }}
      className="text-grow"
      rows={1}
      value={value}
      maxLength={composingMax ?? maxLength}
      onChange={(e) => onChange(e.target.value)}
      onCompositionStart={() => setComposingMax(maxLength)}
      onCompositionEnd={() => setComposingMax(null)}
      onKeyDown={(e) => {
        // 输入法选词时的回车（Safari 下 isComposing 为假，只能靠 229 判断）不能当成换项
        if (e.key !== 'Enter' || e.nativeEvent.isComposing || e.keyCode === 229) return;
        e.preventDefault();
        onEnter?.();
      }}
    />
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
                <img src={withBase(slide.src)} alt={`第 ${i + 1} 张`} />
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
                <IconClose size={12} />
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
                    <img src={withBase(src)} alt={`示例图 ${si + 1}`} />
                  </button>
                ))}
                <label
                  className="image-upload"
                  htmlFor={`${fileInputId}-${i}`}
                  title="上传自己的图片（仅本地预览）"
                >
                  <IconPlus size={14} />
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
            <img src={withBase(src)} alt={`示例图 ${i + 1}`} />
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
