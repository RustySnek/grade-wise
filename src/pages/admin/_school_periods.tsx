"use client"

import { SchoolPeriods } from "@/backend/routers/_app";
import { client } from "@/utils/trpc";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";

function getTimeZone() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return timeZone;
}

const SchoolPeriods = () => {
  const [start_hour, set_start_hour] = useState<string>('');
  const [period_length, set_period_length] = useState<number>(0);
  const [period_number, set_period_number] = useState<number>(0);
  const [school_periods, set_school_periods] = useState<Record<string, SchoolPeriods>>({})
  const [school_id, set_school_id] = useState<number | null>(null);
  const [userTimeZone, setUserTimeZone] = useState('');

  const get_school_periods = async (timezone: string, school_id: number) => {
    const periods = await client["get-school-periods"].query({ school_id, timezone })
    if (periods) {
      set_school_periods(periods)

    }
  }

  useEffect(() => {
    (async () => {
      const timezone = getTimeZone()
      setUserTimeZone(timezone)

      const session = await getSession()
      if (session) {
        set_school_id(session.user.school_id)
        await get_school_periods(timezone, session.user.school_id)
      }
    })()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // Do something with the input values, e.g., send to a backend or process locally
    if (!school_id) {
      return null
    }


    const response = await client["add-period"].query({ timezone: userTimeZone, school_id, start_hour: start_hour, period_length: period_length, period: period_number })
    await get_school_periods(userTimeZone, school_id)
  };
  const remove_period = async (period: number) => {
    if (!school_id) {
      return null
    }
    await client["remove-period"].query({ school_id, period: period })
    school_periods[period.toString()]

    set_school_periods(school_periods => {
      const { [period.toString()]: removed_key, ...updated_periods } = school_periods
      return updated_periods
    })
  }
  return (
    <div className="flex-col flex items-center justify-center">
      {Object.entries(school_periods).map(([key, value]) => {
        return (
          <div>
            {key}: {value.start}-{value.end}
            <button onClick={() => remove_period(+key)} className="ml-2 text-red-600 hover:brightness-125">X</button>
          </div>
        )
      })}
      <form onSubmit={handleSubmit} className="flex-col text-center flex space-y-2">
        <div className=" space-x-4">
          <label>Period start</label>

          <input
            className="bg-[#1f1f1f] rounded-xl px-2 py-1"
            type="time"
            value={start_hour}
            onChange={(e) => set_start_hour(e.target.value)}
            required
          />
        </div>
        <div className="space-x-4 flex-col flex sm:flex-row">
          <div className="space-x-4">
            <label>Length (min)</label>

            <input
              className="bg-[#1f1f1f] appearance-none py-1 w-12 self-center font-bold text-center rounded-xl"
              type="number"
              onChange={(e) => set_period_length(+e.target.value)}
              required
            />
          </div>
          <div className="space-x-4">

            <label>Period number</label>
            <input
              className="bg-[#1f1f1f] appearance-none rounded-xl self-center px-2 w-12 h-8 text-center"
              max={99}
              type="number"
              onChange={(e) => set_period_number(parseInt(e.target.value))}
              required
            />
          </div>
        </div>
        <div>
          <button type="submit" className="w-fit mt-4 self-center transition text-center bg-green-600 font-semibold text-xl px-4 py-1 rounded-xl hover:brightness-125">Submit</button>
        </div>
      </form>
      <form onSubmit={handleSubmit} className="flex-col text-center flex space-y-2">
        <div className=" space-x-4">
          <div className="space-x-4">

            <label>Period number</label>
            <td className="w-10 sm:w-fit rounded">
              <select className="bg-[#2b2b2b] text-center px-2 py-1  text-xs sm:text-xl  rounded-2xl w-full" id="teacher_select" >
                <option value="">Select period</option>

                {Object.entries(school_periods).map(([key, value]) => {
                  return (
                    <option key={key} value={key}>{key} | {value.start}-{value.end}</option>
                  )
                })}


              </select>
            </td>

            <input
              className="bg-[#1f1f1f] appearance-none rounded-xl self-center px-2 w-12 h-8 text-center"
              max={99}
              type="number"
              onChange={(e) => set_period_number(parseInt(e.target.value))}
              required
            />
          </div>        </div>
        <div className="space-x-4 flex-col flex sm:flex-row">
          <div className="space-x-4">
            <label>Period start</label>

            <input
              className="bg-[#1f1f1f] rounded-xl px-2 py-1"
              type="time"
              value={start_hour}
              onChange={(e) => set_start_hour(e.target.value)}
              required
            />

            <label>Length (min)</label>

            <input
              className="bg-[#1f1f1f] appearance-none py-1 w-12 self-center font-bold text-center rounded-xl"
              type="number"
              onChange={(e) => set_period_length(+e.target.value)}
              required
            />
          </div>

        </div>
        <div>
          <button type="submit" className="w-fit mt-4 self-center transition text-center bg-green-600 font-semibold text-xl px-4 py-1 rounded-xl hover:brightness-125">Submit</button>
        </div>
      </form>

    </div>
  );
}
export default SchoolPeriods;
