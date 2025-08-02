// src/tools/AgeCalculator.jsx
import { useState, useEffect } from "react";

export default function AgeCalculator() {
  const [dob, setDob] = useState("");
  const [age, setAge] = useState(null);
  const [nextBirthdayCountdown, setNextBirthdayCountdown] = useState(null);
  const [zodiac, setZodiac] = useState("");

  const getZodiac = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Pisces";
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
    return "Capricorn";
  };

  const calculateAge = () => {
    if (!dob) return;
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const diffMs = today - birthDate;
    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalWeeks = Math.floor(totalDays / 7);

    const nextBirthday = new Date(
      today.getFullYear() + (today >= new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0),
      birthDate.getMonth(),
      birthDate.getDate()
    );
    const countdownMs = nextBirthday - today;

    setAge({ years, months, days, totalWeeks, totalDays, totalHours, totalMinutes, totalSeconds });
    setZodiac(getZodiac(birthDate));
    setNextBirthdayCountdown(countdownMs);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (dob) calculateAge();
    }, 1000);
    return () => clearInterval(timer);
  }, [dob]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-6">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-2xl transition-transform duration-300 hover:scale-[1.01]">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">🎉 Age Calculator</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            calculateAge();
          }}
          className="mb-6"
        >
          <label className="block mb-2 text-lg font-medium">Enter Your Date of Birth:</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
            required
          />
          <button
            type="submit"
            className="mt-4 w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition text-lg"
          >
            Calculate Age
          </button>
        </form>

        {age && (
          <div className="text-center space-y-4">
            <div className="bg-purple-50 p-4 rounded-md">
              <p className="text-xl font-semibold">🎈 You are <span className="text-purple-700">{age.years}</span> years, <span className="text-purple-700">{age.months}</span> months, and <span className="text-purple-700">{age.days}</span> days old.</p>
              <p className="text-md mt-1">Zodiac Sign: <span className="font-semibold text-purple-600">{zodiac}</span></p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="bg-white border p-3 rounded shadow">Weeks: <span className="font-semibold">{age.totalWeeks}</span></div>
              <div className="bg-white border p-3 rounded shadow">Days: <span className="font-semibold">{age.totalDays}</span></div>
              <div className="bg-white border p-3 rounded shadow">Hours: <span className="font-semibold">{age.totalHours}</span></div>
              <div className="bg-white border p-3 rounded shadow">Minutes: <span className="font-semibold">{age.totalMinutes}</span></div>
              <div className="bg-white border p-3 rounded shadow">Seconds: <span className="font-semibold">{age.totalSeconds}</span></div>
            </div>

            {nextBirthdayCountdown !== null && (
              <div className="mt-6 bg-yellow-50 p-4 rounded-md text-yellow-800 text-lg">
                ⏳ Time until next birthday: <strong>{Math.floor(nextBirthdayCountdown / (1000 * 60 * 60 * 24))}</strong> days!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
