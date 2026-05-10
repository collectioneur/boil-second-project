export function Header() {
  return (
    <header className="bg-slate-800 text-white py-6 px-4 shadow-lg">
      <h1 className="text-2xl md:text-3xl font-bold text-center">
        Zagadnienie Pośrednika
      </h1>
      <p className="text-slate-300 text-sm md:text-base text-center mt-2 max-w-2xl mx-auto">
        Metoda maksymalnego elementu macierzy z optymalizacją.
        Wprowadź dane dostawców i odbiorców, ustaw koszty transportu,
        opcjonalnie zablokuj wybrane trasy, a następnie kliknij «Oblicz».
      </p>
    </header>
  );
}
