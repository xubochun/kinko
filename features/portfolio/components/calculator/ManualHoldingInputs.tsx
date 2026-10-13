import { Card, inputCls, labelCls } from './ui';

export type ManualDraft = {
  shares: string;
  avg: string;
  dividends: string;
  price: string;
};

type Props = {
  value: ManualDraft;
  onChange: (next: ManualDraft) => void;
};

const FIELDS: { key: keyof ManualDraft; label: string; placeholder: string }[] =
  [
    { key: 'shares', label: '目前持有股數', placeholder: '例如 1000' },
    { key: 'avg', label: '目前均價（原始成本）', placeholder: '例如 850' },
    { key: 'dividends', label: '已領現金股利總額', placeholder: '沒有可留空' },
    { key: 'price', label: '現價（選填）', placeholder: '用來計算損益' },
  ];

export default function ManualHoldingInputs({ value, onChange }: Props) {
  return (
    <Card title="手動輸入持股" hint="適合試算還沒記錄在 Kinko 的股票">
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <label key={f.key}>
            <span className={labelCls}>{f.label}</span>
            <input
              inputMode="decimal"
              placeholder={f.placeholder}
              value={value[f.key]}
              onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}
              className={inputCls}
            />
          </label>
        ))}
      </div>
    </Card>
  );
}
