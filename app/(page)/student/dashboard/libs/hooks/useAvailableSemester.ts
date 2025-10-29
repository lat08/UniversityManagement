import { useEffect, useState, useCallback } from "react";
import { dashboardApi } from "../api/dashboardApi"
import { SemesterData } from "../types/types"

export const useAvailableSemester = (semesterId : string) => {
    const [semester, setSemester] = useState<SemesterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSemester = useCallback(async () => {
        setLoading(true);
        setError(null);
        try{
            const data = await dashboardApi.getSemesterOverallById(semesterId);
            setSemester(data);
        } catch (err : unknown) {
            console.error("Lỗi khi lấy danh sách khóa học có sẵn:", err);            
            setSemester(null);
        }finally {
          setLoading(false); // ✅ luôn tắt loading dù có lỗi hay không
        }

      },[semesterId]);


      useEffect(() => {
    fetchSemester();
  }, [fetchSemester]);

  return { semester, loading, error, refetch: fetchSemester };
};