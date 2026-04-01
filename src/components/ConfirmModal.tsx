'use client';

import { useEffect } from 'react';
import { AlertTriangle, Trash2, ToggleLeft, Save, X } from 'lucide-react';

type ConfirmVariant = 'danger' | 'warning' | 'info';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ConfirmVariant;
    onConfirm: () => void;
    onCancel: () => void;
}

const variantConfig: Record<ConfirmVariant, { icon: React.ReactNode; confirmClass: string; iconBg: string }> = {
    danger: {
        icon: <Trash2 className="h-6 w-6 text-red-600" />,
        confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
        iconBg: 'bg-red-100',
    },
    warning: {
        icon: <ToggleLeft className="h-6 w-6 text-yellow-600" />,
        confirmClass: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        iconBg: 'bg-yellow-100',
    },
    info: {
        icon: <Save className="h-6 w-6 text-blue-600" />,
        confirmClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        iconBg: 'bg-blue-100',
    },
};

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const config = variantConfig[variant];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-fade-in">
                {/* Close X */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Icon + Title */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${config.iconBg}`}>
                        {config.icon}
                    </div>
                    <div className="pt-1">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{message}</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-4" />

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={() => { onConfirm(); }}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${config.confirmClass}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
