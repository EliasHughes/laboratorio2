type Props = {
  kicker?: string
  title: string
  subtitle?: string
  icon?: React.ReactNode
}

export default function PageHeader({ kicker = 'Yazoo Caribe', title, subtitle, icon }: Props) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-[#E6E2DC] bg-[#1A120E] p-5 flex items-center justify-between gap-4 mb-6">
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#DCA54C]">{kicker}</p>
        <h2 className="text-2xl font-semibold text-white mt-1 flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {subtitle && <p className="text-sm text-[#A89F95] mt-1">{subtitle}</p>}
      </div>
      <img src="/yazoo.png" alt="" className="h-14 w-14 object-contain shrink-0" />
    </div>
  )
}