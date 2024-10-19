import React, { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core"; // Ensure this is imported
import {
  ActivityData,
  CapacitorHealthkit,
  QueryOutput,
  SampleNames,
} from "@perfood/capacitor-healthkit";

const READ_PERMISSIONS = ["steps"];

const StepCounter: React.FC = () => {
  const [stepCount, setStepCount] = useState<number | null>(null);

  const requestAuthorization = async (): Promise<void> => {
    if (Capacitor.getPlatform() !== "ios") {
      console.warn("HealthKit is only available on iOS");
      return;
    }

    try {
      await CapacitorHealthkit.requestAuthorization({
        all: [],
        read: READ_PERMISSIONS,
        write: [],
      });
      console.log("Authorization ok");
    } catch (error) {
      console.error("Error getting auth:", error);
    }
  };

  const getSteps = async () => {
    const today = new Date();
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    try {
      const queryOptions = {
        sampleName: SampleNames.STEP_COUNT,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 0,
      };

      const result = await CapacitorHealthkit.queryHKitSampleType<ActivityData>(
        queryOptions
      );
      console.log("Fetched step data:", result);

      if (result?.resultData) {
        const totalSteps = result.resultData.reduce(
          (acc, data) => acc + data.duration,
          0
        );
        setStepCount(totalSteps);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    requestAuthorization().then(() => {
      getSteps();
    });
  }, []);

  return (
    <div>
      <h1>Steps</h1>
      {stepCount !== null ? (
        <p>You have taken {stepCount} steps</p>
      ) : (
        <p>Loading</p>
      )}
    </div>
  );
};

export default StepCounter;
