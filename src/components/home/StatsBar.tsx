export default function StatsBar() {
  const stats = [
    { number: "1,001+", label: "HAPPY PATIENTS" },
    { number: "50+", label: "SERVICES" },
    { number: "100+", label: "LOCATIONS" },
    { number: "30+", label: "PROGRAMS" },
  ];

  return (
    <section className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center relative">
              <div className="text-4xl md:text-5xl font-serif font-bold text-[#2D2D2D] mb-2">
                {stat.number}
              </div>
              <div className="text-xs md:text-sm font-medium tracking-wider text-gray-600">
                {stat.label}
              </div>
              
              {/* Divider line - hide on last item */}
              {index < stats.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-16 w-px bg-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
