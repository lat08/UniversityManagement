import { useEffect, useState, useCallback } from "react";
import { dashboardApi } from "../api/dashboardApi"
import { SemesterData } from "../types/types"

export const useAvailableSemester = (semesterId : string) => {
    const [semester, setSemester] = useState<SemesterData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSemester = useCallback(async () => {
        if (!semesterId || semesterId.trim() === '') {
          setSemester(null);
          setLoading(false);
          setError(null);
          return;
        }
        
        setLoading(true);
        setError(null);
        try{
            const data = await dashboardApi.getSemesterOverallById(semesterId);
            setSemester(data);
        } catch {
            setSemester(null);
            setError('Không thể tải dữ liệu học kỳ');
        }finally {
          setLoading(false);
        }

      },[semesterId]);


      useEffect(() => {
    fetchSemester();
  }, [fetchSemester]);

  return { semester, loading, error, refetch: fetchSemester };
};