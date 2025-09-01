
import { CVData, CVStyle, SavedCV } from '../types';

const STORAGE_KEY = 'cv-builder-app-data';
const WIP_STORAGE_KEY = 'cv-builder-app-wip';

export interface WIPCV {
    name: string;
    data: CVData;
    style: CVStyle;
    activeCVId: string | null;
}

/**
 * Retrieves all saved CVs from localStorage.
 * @returns An array of SavedCV objects.
 */
export const getSavedCVs = (): SavedCV[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsedData = JSON.parse(data);
            if(Array.isArray(parsedData)) {
                return parsedData;
            }
        }
        return [];
    } catch (error) {
        console.error("Error reading CVs from localStorage", error);
        return [];
    }
};

/**
 * Saves an array of CVs to localStorage.
 * @param cvs The array of SavedCV objects to save.
 */
export const saveCVs = (cvs: SavedCV[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cvs));
    } catch (error) {
        console.error("Error saving CVs to localStorage", error);
    }
};

/**
 * Retrieves the work-in-progress CV from localStorage.
 * @returns A WIPCV object or null.
 */
export const getWIPCV = (): WIPCV | null => {
    try {
        const data = localStorage.getItem(WIP_STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error("Error reading WIP CV from localStorage", error);
        return null;
    }
};

/**
 * Saves the work-in-progress CV to localStorage.
 * @param wipCV The WIPCV object to save.
 */
export const saveWIPCV = (wipCV: WIPCV): void => {
    try {
        localStorage.setItem(WIP_STORAGE_KEY, JSON.stringify(wipCV));
    } catch (error) {
        console.error("Error saving WIP CV to localStorage", error);
    }
};
