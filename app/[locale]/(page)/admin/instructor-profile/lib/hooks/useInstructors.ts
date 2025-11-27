"use client";

import { useEffect, useMemo, useState } from "react";
import { commonApi } from "@/lib/api/common";
import { instructorsApi } from "../api/instructorsApi";
import type { FacultyOption, InstructorListItem, InstructorStatistics } from "../types/types";

interface UseInstructorsResult {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchKeyword: string;
  selectedFacultyId: string;
  setSelectedFacultyId: (value: string) => void;
  selectedDegree: string;
  setSelectedDegree: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;

  faculties: FacultyOption[];
  instructors: InstructorListItem[];
  stats: InstructorStatistics | null;

  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  totalCount: number;
  totalPages: number;

  loading: boolean;
}

export function useInstructors(): UseInstructorsResult {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [faculties, setFaculties] = useState<FacultyOption[]>([]);
  const [instructors, setInstructors] = useState<InstructorListItem[]>([]);
  const [stats, setStats] = useState<InstructorStatistics | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchKeyword(searchQuery.trim());
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await commonApi.getFaculties();
        if (res.success) {
          setFaculties(res.data);
        }
      } catch (error) {
        console.error("Error fetching faculties", error);
      }
    };

    fetchFaculties();
  }, []);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const res = await instructorsApi.getInstructors({
        pageNumber: currentPage,
        pageSize,
        searchKeyword: searchKeyword || undefined,
        facultyId: selectedFacultyId || undefined,
        degree: selectedDegree || undefined,
        employmentStatus: selectedStatus || undefined,
      });

      if (res.success) {
        setInstructors(res.data.instructors);
        setStats(res.data.statistics);
        setTotalCount(res.data.pagination.totalCount);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching instructors", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedFacultyId, selectedDegree, selectedStatus, searchKeyword]);

  useMemo(() => stats, [stats]);

  return {
    searchQuery,
    setSearchQuery,
    searchKeyword,
    selectedFacultyId,
    setSelectedFacultyId,
    selectedDegree,
    setSelectedDegree,
    selectedStatus,
    setSelectedStatus,
    faculties,
    instructors,
    stats,
    currentPage,
    setCurrentPage,
    pageSize,
    totalCount,
    totalPages,
    loading,
  };
}