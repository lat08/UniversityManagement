import { useState, useEffect } from 'react';
import { studentsApi } from '../api/studentsApi';
import { StudentDetail } from '../types/types';

export function useStudentDetail(studentId: string | null) {
  const [studentData, setStudentData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchStudentDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await studentsApi.getStudentById(studentId);
        
        if (isMounted && response.success) {
          setStudentData(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Không thể tải thông tin sinh viên');
          console.error('Error fetching student detail:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStudentDetail();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  return { studentData, loading, error, setStudentData };
}




