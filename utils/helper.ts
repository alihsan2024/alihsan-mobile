"use client";

// import { isValidPhoneNumber } from "libphonenumber-js"; // Uncomment if available in your environment
import * as XLSX from "xlsx";
// import { currencyConfig } from "@/utils/constants"; // Uncomment if available
// import { SnackMessages } from "@/components/ui/Toast"; // Uncomment if available
import { useSelector } from "react-redux";
// const { showErrorMessage } = SnackMessages();

export function getCountryLengths(
  phoneNumber: string,
  country: string
): boolean {
  // return isValidPhoneNumber(phoneNumber, country.toUpperCase());
  return true; // Dummy for React Native
}

export function formatPrice(price: number | string): string {
  const parsedPrice = typeof price === "string" ? parseFloat(price) : price;
  return !isNaN(parsedPrice)
    ? parsedPrice.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0";
}

export function getDateRange(option: string): {
  startDate: string;
  endDate: string;
} {
  const currentDate = new Date();
  let startDate, endDate;

  switch (option) {
    case "today":
      startDate = new Date(currentDate);
      endDate = new Date(currentDate);
      break;
    case "yesterday":
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 1);
      endDate = new Date(startDate);
      break;
    case "this_week":
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - currentDate.getDay());
      endDate = new Date(currentDate);
      break;
    case "last_week":
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - currentDate.getDay() - 7);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      break;
    case "past_two_weeks":
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - 14);
      endDate = new Date(currentDate);
      break;
    case "this_month":
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      break;
    case "last_month":
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      );
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      break;

    case "this_year":
      startDate = new Date(currentDate.getFullYear(), 0, 1);
      endDate = new Date(currentDate.getFullYear(), 11, 31);
      break;
    case "last_year":
      startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
      endDate = new Date(currentDate.getFullYear() - 1, 11, 31);
      break;
    default:
      startDate = null;
      endDate = null;
  }

  startDate = startDate ? new Date(startDate).toISOString().split("T")[0] : "";
  endDate = endDate ? new Date(endDate).toISOString().split("T")[0] : "";
  return { startDate, endDate };
}

export const handleDownload = async (doc: string): Promise<void> => {
  // Not supported in React Native
};

export const exportData = (data: any[], fileName: string): void => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet 1");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const makeSlug = (title: string): string => {
  let slug = "";
  for (const i of title.matchAll(/[a-z0-9\s]/gi)) {
    slug += i[0] === " " ? "-" : i[0].toLowerCase();
  }
  return slug;
};

export const validateSlug = (slug: string): string => {
  if (/[^a-z0-9-_]/.test(slug))
    return "Only lower case alphabets, numbers, hyphens (-) and underscores (_) are allowed";
  return "";
};

export const retrieveUserInfo = (): {
  token: string | null;
  role: string | null;
} => {
  // Not supported in React Native
  return { token: null, role: null };
};

export const checkAdminPermission = (campaign: any): void => {
  // Not supported in React Native
};

export const calculateAge = (dateOfBirth: string | Date): number => {
  const dob = new Date(dateOfBirth);
  const now = new Date();

  if (dob > now) return 0; // future date: age 0

  let age = now.getFullYear() - dob.getFullYear();

  const monthDiff = now.getMonth() - dob.getMonth();
  const dayDiff = now.getDate() - dob.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
};

export const getRecurringLabel = (periodDays: string | number): string => {
  const days =
    typeof periodDays === "string" ? parseInt(periodDays) : periodDays;
  switch (days) {
    case 7:
      return "Weekly";
    case 9:
      return "Friday";
    case 30:
      return "Monthly";
    case 365:
      return "Yearly";
    case 1:
      return "Daily";
    case 10:
      return "10 Days";
    default:
      return "";
  }
};

export const useFedyahPricers = () => {
  // Not supported in React Native
  return [() => 0, (str: string) => str];
};

export function nl2br(
  str: string,
  replaceMode?: boolean,
  isXhtml?: boolean
): { __html: string } {
  var breakTag = isXhtml ? "<br />" : "<br>";
  var replaceStr = replaceMode ? "$1" + breakTag : "$1" + breakTag + "$2";
  return {
    __html: (str + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, replaceStr),
  };
}

export function generateRandomPassword(length: number = 12): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const allChars = lowercase + uppercase + numbers + symbols;

  let password = "";

  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  password = password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");

  return password;
}

const statusHierarchy: { [key: string]: number } = {
  Active: 3,
  Unverified: 2,
  Inactive: 1,
};

export const validateMerge = (
  mergedRows: any[],
  mergedTo: any
): { isValid: boolean; message: string } => {
  if (!mergedTo || Object.keys(mergedTo).length === 0) {
    return { isValid: false, message: "No target row selected for merging." };
  }

  if (mergedRows.length === 0) {
    return { isValid: false, message: "No rows selected for merging." };
  }

  const mergedToStatus = statusHierarchy[mergedTo.status] || 0;

  for (let row of mergedRows) {
    const rowStatus = statusHierarchy[row.status] || 0;

    if (rowStatus > mergedToStatus) {
      return {
        isValid: false,
        message: `Cannot merge ${row.status} status into ${mergedTo.status} status.`,
      };
    }
  }

  return { isValid: true, message: "Merge validation passed." };
};

export const formatOrphanName = (fullName: string): string => {
  if (!fullName) return "";

  const nameParts = fullName.trim().split(" ");

  if (nameParts.length === 1) {
    // If only one name, return as is
    return nameParts[0];
  }

  if (nameParts.length === 2) {
    // If two names, show first name + first letter of last name
    const firstName = nameParts[0];
    const lastNameInitial = nameParts[1].charAt(0);
    return `${firstName} ${lastNameInitial}.`;
  }

  // If more than two names, show first name + first letter of last name
  const firstName = nameParts[0];
  const lastNameInitial = nameParts[nameParts.length - 1].charAt(0);
  return `${firstName} ${lastNameInitial}.`;
};
