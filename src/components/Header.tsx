export function Header() {
  return (
    <header className="px-16 pt-16 pb-10">
      <h1
        className="font-black text-black leading-none"
        style={{ fontSize: 'clamp(48px, 8vw, 96px)', letterSpacing: '-0.04em' }}
      >
        Zagadnienie Pośrednika
      </h1>
      <p className="text-[18px] text-black mt-4 leading-relaxed max-w-3xl">
        Metoda maksymalnego elementu macierzy z optymalizacją.
        Wprowadź dane dostawców i odbiorców, ustaw koszty transportu,
        opcjonalnie zablokuj wybrane trasy, a następnie kliknij «Oblicz».
      </p>
    </header>
  );
}
