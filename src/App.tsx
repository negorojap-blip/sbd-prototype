import React from 'react';
import { useSbdSession } from './hooks/useSbdSession';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CancelModal } from './components/Modal/CancelModal';
import { StaffCallModal } from './components/Modal/StaffCallModal';
import { BagPositionWarningModal } from './components/Modal/BagPositionWarningModal';
import { TrayRequiredModal } from './components/Modal/TrayRequiredModal';
import { HeavyTagWarningModal } from './components/Modal/HeavyTagWarningModal';

import { Sbd001PlaceBag } from './screens/Sbd001PlaceBag';
import { Sbd002ConfirmContents } from './screens/Sbd002ConfirmContents';
import { Sbd003ScanTicket } from './screens/Sbd003ScanTicket';
import { Sbd004Verifying } from './screens/Sbd004Verifying';
import { Sbd005FlightInfo } from './screens/Sbd005FlightInfo';
import { Sbd006WeightPrice } from './screens/Sbd006WeightPrice';
import { SbdP01Payment } from './screens/SbdP01Payment';
import { Sbd007HeavyTag } from './screens/Sbd007HeavyTag';
import { Sbd009Conveying } from './screens/Sbd009Conveying';
import { Sbd010Complete } from './screens/Sbd010Complete';
import { SbdSimulatorApp } from './simulator/SbdSimulatorApp';

const SbdKioskApp: React.FC = () => {
  const { session, dispatchAction, triggerDeviceEvent } =
    useSbdSession();

  const {
    screenId,
    language,
    cancelModalOpen,
    staffCalling,
    hazardousWarningOpen,
    bagMisplaced,
    bagNeedsTray,
    heavyTagWarningOpen,
    flightInfo,
    baggageInfo,
    deviceStatus,
    countdownSeconds,
  } = session;

  const renderScreenContent = () => {
    switch (screenId) {
      case 'SBD-001':
        return (
          <Sbd001PlaceBag
            language={language}
            onSimulatePlaceBag={() => triggerDeviceEvent('PLACE_BAG')}
          />
        );
      case 'SBD-002':
        return <Sbd002ConfirmContents language={language} />;
      case 'SBD-003':
        return (
          <Sbd003ScanTicket
            language={language}
            onSimulateScan={() => triggerDeviceEvent('SCAN_BOARDING_PASS')}
          />
        );
      case 'SBD-004':
        return (
          <Sbd004Verifying
            language={language}
            onSimulateVerifyComplete={() =>
              triggerDeviceEvent('VERIFY_COMPLETE')
            }
          />
        );
      case 'SBD-005':
        return <Sbd005FlightInfo language={language} flightInfo={flightInfo} />;
      case 'SBD-006':
        return (
          <Sbd006WeightPrice language={language} baggageInfo={baggageInfo} />
        );
      case 'SBD-P01':
        return (
          <SbdP01Payment
            language={language}
            baggageInfo={baggageInfo}
            paymentCompleted={Boolean(deviceStatus.paymentCompleted)}
            onSimulatePaymentComplete={() => dispatchAction('COMPLETE_PAYMENT')}
          />
        );
      case 'SBD-007':
        return <Sbd007HeavyTag language={language} />;
      case 'SBD-009':
        return (
          <Sbd009Conveying
            language={language}
            onSimulateConveyComplete={() =>
              triggerDeviceEvent('CONVEY_COMPLETE')
            }
          />
        );
      case 'SBD-010':
        return (
          <Sbd010Complete
            language={language}
            receiptPrinted={Boolean(deviceStatus.receiptPrinted)}
            countdownSeconds={countdownSeconds}
            onAddAnotherBag={() => dispatchAction('ADD_ANOTHER_BAG')}
            onExtendTime={() => dispatchAction('EXTEND_TIME')}
          />
        );
    }
  };

  const renderFooter = () => {
    switch (screenId) {
      case 'SBD-001':
        return (
          <Footer
            screenId="SBD-001"
            language={language}
            onCallStaff={() => dispatchAction('CALL_STAFF')}
            autoAdvanceNoteJa="手荷物を置くと、自動で次に進みます。"
            autoAdvanceNoteEn="Automatically proceeds when baggage is placed."
          />
        );
      case 'SBD-002':
        return (
          <Footer
            screenId="SBD-002"
            language={language}
            onCallStaff={() => dispatchAction('CALL_STAFF')}
            secondaryAction={() => dispatchAction('CONFIRM_CONTENTS_YES')}
            secondaryLabelJa="入っています"
            secondaryLabelEn="Yes, it does"
            onPrimaryAction={() => dispatchAction('CONFIRM_CONTENTS_NO')}
            primaryLabelJa="入っていません・次へ"
            primaryLabelEn="No, Continue"
          />
        );
      case 'SBD-003':
        return (
          <Footer
            screenId="SBD-003"
            language={language}
            onCallStaff={() => dispatchAction('CALL_STAFF')}
            onOpenCancel={() => dispatchAction('OPEN_CANCEL_MODAL')}
            autoAdvanceNoteJa="読み取ると、自動で次に進みます。"
            autoAdvanceNoteEn="Automatically proceeds after scanning."
          />
        );
      case 'SBD-004':
        return (
          <Footer
            screenId="SBD-004"
            language={language}
            onCallStaff={() => dispatchAction('CALL_STAFF')}
            onOpenCancel={() => dispatchAction('OPEN_CANCEL_MODAL')}
            autoAdvanceNoteJa="確認が終わると、自動で次に進みます。"
            autoAdvanceNoteEn="Automatically proceeds when verified."
          />
        );
      case 'SBD-005':
        return (
          <Footer
            screenId="SBD-005"
            language={language}
            onCallStaff={() => dispatchAction('CALL_STAFF')}
            onOpenCancel={() => dispatchAction('OPEN_CANCEL_MODAL')}
            onPrimaryAction={() => dispatchAction('CONFIRM_FLIGHT')}
            primaryLabelJa="確認して次へ"
            primaryLabelEn="Confirm & Next"
          />
        );
      case 'SBD-006':
        return (
          <Footer
            screenId="SBD-006"
            language={language}
            onCallStaff={() => dispatchAction('CALL_STAFF')}
            onOpenCancel={() => dispatchAction('OPEN_CANCEL_MODAL')}
            onPrimaryAction={() => dispatchAction('CONFIRM_WEIGHT')}
            primaryLabelJa="確認して次へ"
            primaryLabelEn="Confirm & Next"
          />
        );
      case 'SBD-P01':
        return (
          <Footer
            screenId="SBD-P01"
            language={language}
            onCallStaff={() => dispatchAction('CALL_STAFF')}
            onOpenCancel={() => dispatchAction('OPEN_CANCEL_MODAL')}
            autoAdvanceNoteJa="お支払い後、自動で次に進みます。"
            autoAdvanceNoteEn="Automatically proceeds after payment."
          />
        );
      case 'SBD-007':
        return (
          <Footer
            screenId="SBD-007"
            language={language}
            onCallStaff={() => dispatchAction('CALL_STAFF')}
            onOpenCancel={() => dispatchAction('OPEN_CANCEL_MODAL')}
            onPrimaryAction={() => dispatchAction('CONFIRM_HEAVY_TAG')}
            primaryLabelJa="タグを付けました"
            primaryLabelEn="Tag Attached"
          />
        );
      case 'SBD-009':
        return (
          <Footer
            screenId="SBD-009"
            language={language}
            onCallStaff={() => dispatchAction('CALL_STAFF')}
          />
        );
      case 'SBD-010':
        return (
          <Footer
            screenId="SBD-010"
            language={language}
            onCallStaff={() => dispatchAction('CALL_STAFF')}
          />
        );
    }
  };

  return (
    <div className="w-screen h-screen bg-[#f6f8fa] flex flex-col justify-between overflow-hidden select-none relative">
      <Header
        screenId={screenId}
        language={language}
        onToggleLanguage={() => dispatchAction('TOGGLE_LANGUAGE')}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {renderScreenContent()}
      </main>

      {renderFooter()}

      <CancelModal
        open={cancelModalOpen}
        language={language}
        onContinue={() => dispatchAction('CLOSE_CANCEL_MODAL')}
        onConfirmCancel={() => dispatchAction('CONFIRM_CANCEL')}
      />

      <StaffCallModal
        staffCalling={staffCalling}
        hazardousWarningOpen={hazardousWarningOpen}
        language={language}
        onDismissStaff={() => dispatchAction('DISMISS_STAFF')}
        onDismissHazardous={() => dispatchAction('DISMISS_HAZARDOUS_WARNING')}
        onConfirmCancel={() => dispatchAction('CONFIRM_CANCEL')}
      />

      <BagPositionWarningModal
        open={Boolean(bagMisplaced)}
        language={language}
        onDismiss={() => dispatchAction('DISMISS_BAG_MISPLACED')}
      />

      <TrayRequiredModal
        open={Boolean(bagNeedsTray)}
        language={language}
        onDismiss={() => dispatchAction('DISMISS_TRAY_REQUIRED')}
      />

      <HeavyTagWarningModal
        open={Boolean(heavyTagWarningOpen)}
        language={language}
        onDismiss={() => dispatchAction('DISMISS_HEAVY_TAG_WARNING')}
      />
    </div>
  );
};

export const App: React.FC = () => {
  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const windowType = searchParams.get('window');

  // Open Simulator when path is /simulator or ?window=simulator
  const isSimulatorWindow =
    pathname.startsWith('/simulator') || windowType === 'simulator';

  if (isSimulatorWindow) {
    return <SbdSimulatorApp />;
  }

  return <SbdKioskApp />;
};

export default App;
