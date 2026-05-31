import { useState } from "react";
import { motion } from "framer-motion";

type Bool = boolean;
const ROWS: [Bool, Bool][] = [
  [false, false],
  [false, true],
  [true, false],
  [true, true],
];

const T = (v: boolean) => (v ? "T" : "F");

export default function TruthTableLab() {
  const [P, setP] = useState(false);
  const [Q, setQ] = useState(false);

  return (
    <div className="flex flex-col items-center gap-8 p-6 select-none">
      {/* Toggles */}
      <div className="flex gap-8">
        {(["P", "Q"] as const).map((label) => {
          const val = label === "P" ? P : Q;
          const set = label === "P" ? setP : setQ;
          return (
            <div key={label} className="flex flex-col items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => set(!val)}
                className={`w-20 h-20 rounded-2xl text-3xl font-bold transition-all shadow-sm ${
                  val
                    ? "bg-[#4f46e5] text-white shadow-[#4f46e5]/30"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {T(val)}
              </motion.button>
              <span className="text-base font-bold text-gray-500">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="w-full max-w-lg overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {["P", "Q", "P ∧ Q", "P ∨ Q", "¬P", "P → Q"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([p, q], i) => {
              const active = p === P && q === Q;
              return (
                <motion.tr
                  key={i}
                  animate={{ backgroundColor: active ? "#f5f4ff" : "#ffffff" }}
                  className="border-t border-gray-100"
                >
                  {[p, q, p && q, p || q, !p, !p || q].map((val, j) => (
                    <td
                      key={j}
                      className={`px-4 py-3 font-mono font-bold ${
                        active
                          ? "text-[#4f46e5]"
                          : val
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      {T(val)}
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 text-center max-w-sm">
        Click P or Q to toggle between True and False. The highlighted row shows
        the current assignment across all six operations.
      </p>
    </div>
  );
}
