export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="h-5 w-5 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8" />
      <p className="text-[20px] leading-tight text-foreground sm:text-[22px] md:text-[24px]">
        Loading...
      </p>
    </div>
  );
}
