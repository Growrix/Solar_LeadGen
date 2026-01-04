'use client';

import React from 'react';

export type EditorTabKey = 'GENERAL' | 'SEO' | 'AI';

export function EditorTabs(props: {
	active: EditorTabKey;
	onChange: (tab: EditorTabKey) => void;
}) {
	const { active, onChange } = props;

	const tabs: Array<{ key: EditorTabKey; label: string }> = [
		{ key: 'GENERAL', label: 'General' },
		{ key: 'SEO', label: 'SEO' },
		{ key: 'AI', label: 'AI' },
	];

	return (
		<div className="flex items-center gap-2">
			{tabs.map((t) => (
				<button
					key={t.key}
					type="button"
					onClick={() => onChange(t.key)}
					className={
						active === t.key
							? 'btn-neu px-3 py-1 text-ui shadow-neu-inset'
							: 'btn-neu px-3 py-1 text-ui'
					}
				>
					{t.label}
				</button>
			))}
		</div>
	);
}
