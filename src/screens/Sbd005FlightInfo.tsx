import React from 'react';
import type { FlightInfo, Language } from '../types/sbd';

interface Sbd005FlightInfoProps {
  language: Language;
  flightInfo: FlightInfo;
}

export const Sbd005FlightInfo: React.FC<Sbd005FlightInfoProps> = ({
  language,
  flightInfo,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between px-14 pt-6 pb-3 overflow-hidden">
      {/* Main Title */}
      <h2 className="text-[48px] font-extrabold text-[#0b253c] tracking-tight">
        {language === 'ja'
          ? '表示内容をご確認ください'
          : 'Please confirm your flight details'}
      </h2>

      {/* Destination Airport Block */}
      <div className="w-full pt-2">
        <p className="text-[24px] font-bold text-[#0b253c] mb-1">
          {language === 'ja'
            ? '手荷物の受け取り空港'
            : 'Baggage Claim Airport'}
        </p>
        <div className="flex items-baseline justify-between pb-5 border-b border-slate-300">
          <div className="text-[64px] font-extrabold text-[#0b253c] tracking-tight leading-none">
            {language === 'ja' ? flightInfo.destination : flightInfo.destinationEn}
          </div>
          <div className="text-[56px] font-extrabold text-slate-600 tracking-wider leading-none">
            {flightInfo.airportCode}
          </div>
        </div>
      </div>

      {/* Flight Details Block */}
      <div className="w-full pt-1 pb-2">
        <p className="text-[24px] font-bold text-[#0b253c] mb-2">
          {language === 'ja' ? '搭乗便' : 'Flight'}
        </p>
        <div className="text-[34px] font-extrabold text-[#0b253c] mb-6 pl-3">
          {language === 'ja' ? (
            <>
              {flightInfo.origin} <span className="mx-2 font-normal">→</span>{' '}
              {flightInfo.destination}
            </>
          ) : (
            <>
              {flightInfo.originEn} <span className="mx-2 font-normal">→</span>{' '}
              {flightInfo.destinationEn}
            </>
          )}
        </div>

        {/* 3 Columns: Flight No, Date, Time */}
        <div className="grid grid-cols-3 divide-x divide-slate-300 pl-3">
          <div className="pr-10">
            <div className="text-[20px] font-medium text-slate-600 mb-1">
              {language === 'ja' ? '便名' : 'Flight No.'}
            </div>
            <div className="text-[44px] font-extrabold text-[#0b253c] leading-tight">
              {flightInfo.flightNumber}
            </div>
          </div>

          <div className="px-12">
            <div className="text-[20px] font-medium text-slate-600 mb-1">
              {language === 'ja' ? '出発日' : 'Date'}
            </div>
            <div className="text-[42px] font-extrabold text-[#0b253c] leading-tight">
              {language === 'ja'
                ? flightInfo.departureDate
                : flightInfo.departureDateEn}
            </div>
          </div>

          <div className="pl-12 flex flex-col justify-between">
            <div>
              <div className="text-[20px] font-medium text-slate-600 mb-1">
                {language === 'ja' ? '出発時刻' : 'Departure Time'}
              </div>
              <div className="text-[44px] font-extrabold text-[#0b253c] leading-tight">
                {flightInfo.departureTime}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-end mt-1">
          <span className="text-slate-500 text-[15px]">
            {language === 'ja' ? '表示例' : 'Sample Display'}
          </span>
        </div>
      </div>
    </div>
  );
};
