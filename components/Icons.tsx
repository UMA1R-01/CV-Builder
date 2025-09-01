
import React from 'react';

interface IconProps {
    className?: string;
    style?: React.CSSProperties;
}

// Basic Icons
export const PlusIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

export const GripVerticalIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15" />
    </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 3.75h-9.75A1.125 1.125 0 0 0 8.625 4.875v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125Z" />
    </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

export const EyeSlashIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L6.228 6.228" />
    </svg>
);

export const SaveIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

export const EnvelopeIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.213-.992-.55-1.348l-5.454-5.454a.75.75 0 0 0-1.06 0L11.25 12.336a11.25 11.25 0 0 1-5.58-5.58l.42-1.05a.75.75 0 0 0 0-1.06L3.6 2.808A1.125 1.125 0 0 0 2.25 3.368v1.372c0 .621.504 1.125 1.125 1.125H4.5" />
    </svg>
);

export const GlobeAltIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 0 1-9-9H12v9Zm0 0a9 9 0 0 0 9-9h-9v9ZM12 21a9 9 0 0 0 9-9h-9v9Zm0-9.75h.008v.008H12v-.008ZM12 3a9 9 0 0 0-9 9h9V3Zm9 9a9 9 0 0 1-9 9v-9h9ZM3 12a9 9 0 0 1 9-9v9H3Z" />
    </svg>
);

export const MapPinIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
);

export const XMarkIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

export const FolderPlusIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5a.75.75 0 0 1 .75.75v9a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75v-9a.75.75 0 0 1 .75-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 17.25v-9.75A1.5 1.5 0 0 1 4.5 6h4.5a1.5 1.5 0 0 1 1.06.44l2.88 2.88a1.5 1.5 0 0 0 1.06.44H19.5a1.5 1.5 0 0 1 1.5 1.5v.25" />
    </svg>
);

export const PageBreakIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 9h9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h9" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2" d="M2.25 12h19.5" />
    </svg>
);

// Editor Icons
export const BoldIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className} style={style}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 5h3.344c1.88 0 3.406 1.526 3.406 3.406S13.474 11.812 11.594 11.812H8.25V5zM8.25 11.812h3.875c2.28 0 4.125 1.845 4.125 4.125S14.41 20.062 12.125 20.062H8.25V11.812z" />
    </svg>
);

export const ItalicIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className} style={style}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 5h6m-6.5 14h6m-5.4-14L8.1 19" />
    </svg>
);

export const UnderlineIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className} style={style}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 5v5.5c0 3.314 2.686 6 6 6s6-2.686 6-6V5M5 20h14" />
    </svg>
);

export const ListBulletIcon: React.FC<IconProps> = ({ className = "w-6 h-6", style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} style={style}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.01v.01H3.75V6.75zm0 5.25h.01v.01H3.75V12zm0 5.25h.01v.01H3.75v-.01z" />
    </svg>
);