import React from 'react';
import { CVStyle, DateFormat } from '../types';
import { FONT_OPTIONS } from '../constants';

interface StyleControlsProps {
    style: CVStyle;
    setStyle: React.Dispatch<React.SetStateAction<CVStyle>>;
}

const ColorInput: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 flex items-center gap-2">
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 p-0 border-none cursor-pointer rounded"
                style={{backgroundColor: 'transparent'}}
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="block w-full px-2 py-1 text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="#000000"
            />
        </div>
    </div>
);

const SliderInput: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    unit?: string;
}> = ({ label, value, onChange, min, max, step, unit = 'rem' }) => (
    <div>
        <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <span className="text-xs font-mono text-gray-500">{value.toFixed(2)} {unit}</span>
        </div>
        <input
            type="range"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
    </div>
);


const StyleControls: React.FC<StyleControlsProps> = ({ style, setStyle }) => {

    const handleStyleChange = <K extends keyof CVStyle>(key: K, value: CVStyle[K]) => {
        setStyle(prev => ({ ...prev, [key]: value }));
    };

    const selectClassName = "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md";

    return (
        <div className="p-4 space-y-6">
            <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-gray-900">Typography</legend>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Font Family</label>
                    <select
                        value={style.fontFamily}
                        onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                        className={selectClassName}
                    >
                        {FONT_OPTIONS.map(font => <option key={font.name} value={font.value}>{font.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Font Size</label>
                    <select
                        value={style.fontSize}
                        onChange={(e) => handleStyleChange('fontSize', e.target.value as CVStyle['fontSize'])}
                        className={selectClassName}
                    >
                        <option value="text-xs">X-Small</option>
                        <option value="text-sm">Small</option>
                        <option value="text-base">Medium</option>
                        <option value="text-lg">Large</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Line Height</label>
                    <select
                        value={style.lineHeight}
                        onChange={(e) => handleStyleChange('lineHeight', e.target.value as CVStyle['lineHeight'])}
                        className={selectClassName}
                    >
                        <option value="leading-tight">Tight</option>
                        <option value="leading-normal">Normal</option>
                        <option value="leading-relaxed">Relaxed</option>
                    </select>
                </div>
            </fieldset>

             <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-gray-900">Colors</legend>
                <ColorInput label="Accent Color" value={style.accentColor} onChange={value => handleStyleChange('accentColor', value)} />
                <ColorInput label="Headings Color" value={style.headingColor} onChange={value => handleStyleChange('headingColor', value)} />
                <ColorInput label="Body Text Color" value={style.bodyTextColor} onChange={value => handleStyleChange('bodyTextColor', value)} />
            </fieldset>
            
            <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-gray-900">Layout</legend>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Margin</label>
                    <select
                        value={style.margin}
                        onChange={(e) => handleStyleChange('margin', e.target.value as CVStyle['margin'])}
                        className={selectClassName}
                    >
                        <option value="p-4">Small</option>
                        <option value="p-8">Medium</option>
                        <option value="p-12">Large</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Section Spacing</label>
                    <select
                        value={style.sectionSpacing}
                        onChange={(e) => handleStyleChange('sectionSpacing', e.target.value as CVStyle['sectionSpacing'])}
                        className={selectClassName}
                    >
                        <option value="mb-3">Small</option>
                        <option value="mb-4">Medium</option>
                        <option value="mb-6">Large</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Header Alignment</label>
                    <select
                        value={style.pageAlignment}
                        onChange={(e) => handleStyleChange('pageAlignment', e.target.value as CVStyle['pageAlignment'])}
                        className={selectClassName}
                    >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Primary Heading</label>
                    <select
                        value={style.headingStyle || 'titleFirst'}
                        onChange={(e) => handleStyleChange('headingStyle', e.target.value as 'companyFirst' | 'titleFirst')}
                        className={selectClassName}
                    >
                        <option value="companyFirst">Company / Institution</option>
                        <option value="titleFirst">Job Title / Degree</option>
                    </select>
                </div>
            </fieldset>

             <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-gray-900">Personal Info Layout</legend>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Items per Row</label>
                    <select
                        value={style.personalInfoColumns}
                        onChange={(e) => handleStyleChange('personalInfoColumns', parseInt(e.target.value, 10) as CVStyle['personalInfoColumns'])}
                        className={selectClassName}
                    >
                        <option value={1}>One</option>
                        <option value={2}>Two</option>
                        <option value={3}>Three</option>
                        <option value={4}>Four</option>
                    </select>
                </div>
                 <SliderInput
                    label="Column Spacing"
                    value={style.personalInfoColumnGap}
                    onChange={value => handleStyleChange('personalInfoColumnGap', value)}
                    min={0} max={8} step={0.25} unit="rem"
                />
                 <SliderInput
                    label="Row Spacing"
                    value={style.personalInfoRowGap}
                    onChange={value => handleStyleChange('personalInfoRowGap', value)}
                    min={0} max={2} step={0.1} unit="rem"
                />
                <SliderInput
                    label="Label-Value Spacing"
                    value={style.personalInfoLabelValueGap}
                    onChange={value => handleStyleChange('personalInfoLabelValueGap', value)}
                    min={0} max={4} step={0.1} unit="rem"
                />
            </fieldset>
            
             <fieldset className="space-y-4">
                <legend className="text-lg font-semibold text-gray-900">Formatting</legend>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date Format</label>
                    <select
                        value={style.dateFormat}
                        onChange={(e) => handleStyleChange('dateFormat', e.target.value as DateFormat)}
                        className={selectClassName}
                    >
                        <option value="Month YYYY">Month YYYY (e.g., January 2024)</option>
                        <option value="MM/YYYY">MM/YYYY (e.g., 01/2024)</option>
                        <option value="YYYY">YYYY (e.g., 2024)</option>
                    </select>
                </div>
            </fieldset>
        </div>
    );
};

export default StyleControls;