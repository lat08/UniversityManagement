'use client';

import React, { useState, useRef, useEffect, ReactNode, useMemo } from 'react';

export interface ResizableColumn {
  key: string;
  label: string;
  width: number;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  visible?: boolean;
  required?: boolean;
}

interface ResizableTableProps<T = unknown> {
  columns: ResizableColumn[];
  data: T[];
  renderRow: (item: T, visibleColumns: ResizableColumn[], cellStyle: { paddingX: string; paddingY: string }) => ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  loadingComponent?: ReactNode;
  onColumnsResize?: (columns: ResizableColumn[]) => void;
  renderHeaderCheckbox?: () => ReactNode;
}

export function ResizableTable<T = unknown>({
  columns,
  data,
  renderRow,
  isLoading = false,
  emptyMessage = 'Không có dữ liệu',
  loadingComponent,
  onColumnsResize,
  renderHeaderCheckbox,
}: ResizableTableProps<T>) {
  const [localColumns, setLocalColumns] = useState<ResizableColumn[]>(columns);
  const [resizingIndex, setResizingIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const tableRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const visibleColumns = localColumns.filter(col => col.visible !== false);

  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        if (width > 0) {
          setContainerWidth(width);
        }
      }
    };

    const timeoutId = setTimeout(updateContainerWidth, 0);
    window.addEventListener('resize', updateContainerWidth);

    const resizeObserver = new ResizeObserver(() => {
      updateContainerWidth();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateContainerWidth);
      resizeObserver.disconnect();
    };
  }, [visibleColumns.length]);

  const baseTotalWidth = visibleColumns.reduce((sum, col) => sum + col.width, 0);

  const adjustedColumns = useMemo(() => {
    if (baseTotalWidth === 0 || visibleColumns.length === 0) {
      return visibleColumns.map(col => ({
        ...col,
        widthPercent: 100 / Math.max(visibleColumns.length, 1),
      }));
    }

    if (containerWidth === 0) {
      return visibleColumns.map(col => ({
        ...col,
        widthPercent: (col.width / baseTotalWidth) * 100,
      }));
    }

    const minTotalWidth = visibleColumns.reduce((sum, col) => sum + (col.minWidth || 80), 0);
    
    if (baseTotalWidth <= containerWidth) {
      return visibleColumns.map(col => ({
        ...col,
        widthPercent: (col.width / baseTotalWidth) * 100,
      }));
    }

    if (minTotalWidth >= containerWidth) {
      const scaleFactor = containerWidth / minTotalWidth;
      const columnsWithPercent = visibleColumns.map(col => {
        const scaledWidth = (col.minWidth || 80) * scaleFactor;
        return {
          ...col,
          width: scaledWidth,
          widthPercent: (scaledWidth / containerWidth) * 100,
        };
      });
      const totalPercent = columnsWithPercent.reduce((sum, col) => sum + (col.widthPercent || 0), 0);
      if (Math.abs(totalPercent - 100) > 0.01 && columnsWithPercent.length > 0) {
        const diff = 100 - totalPercent;
        columnsWithPercent[columnsWithPercent.length - 1].widthPercent = 
          (columnsWithPercent[columnsWithPercent.length - 1].widthPercent || 0) + diff;
      }
      return columnsWithPercent;
    }

    const minWidths = visibleColumns.map(col => col.minWidth || 80);
    const minWidthTotal = minWidths.reduce((sum, w) => sum + w, 0);
    const remainingWidth = containerWidth - minWidthTotal;
    const flexibleWidths = visibleColumns.map(col => col.width - (col.minWidth || 80));
    const flexibleTotal = flexibleWidths.reduce((sum, w) => sum + w, 0);
    const scaleFactor = flexibleTotal > 0 ? remainingWidth / flexibleTotal : 0;

    const columnsWithPercent = visibleColumns.map((col, idx) => {
      const minWidth = minWidths[idx];
      const flexibleWidth = Math.max(0, flexibleWidths[idx] * scaleFactor);
      const finalWidth = minWidth + flexibleWidth;
      return {
        ...col,
        width: finalWidth,
        widthPercent: (finalWidth / containerWidth) * 100,
      };
    });

    const totalPercent = columnsWithPercent.reduce((sum, col) => sum + (col.widthPercent || 0), 0);
    if (Math.abs(totalPercent - 100) > 0.01 && columnsWithPercent.length > 0) {
      const diff = 100 - totalPercent;
      columnsWithPercent[columnsWithPercent.length - 1].widthPercent = 
        (columnsWithPercent[columnsWithPercent.length - 1].widthPercent || 0) + diff;
    }

    return columnsWithPercent;
  }, [visibleColumns, baseTotalWidth, containerWidth]);

  const fontSizeScale = useMemo(() => {
    const columnCount = visibleColumns.length;
    
    if (containerWidth === 0) {
      if (columnCount > 12) return 0.75;
      if (columnCount > 10) return 0.8;
      if (columnCount > 8) return 0.85;
      return 1;
    }

    const minTotalWidth = visibleColumns.reduce((sum, col) => sum + (col.minWidth || 80), 0);
    const isVeryCompact = minTotalWidth >= containerWidth * 0.98;
    const isCompact = minTotalWidth >= containerWidth * 0.9;
    const avgColumnWidth = containerWidth / columnCount;
    
    if (isVeryCompact || avgColumnWidth < 80) {
      return columnCount > 14 ? 0.7 : columnCount > 12 ? 0.75 : columnCount > 10 ? 0.8 : 0.85;
    }
    
    if (isCompact || avgColumnWidth < 100) {
      return columnCount > 12 ? 0.75 : columnCount > 10 ? 0.8 : columnCount > 8 ? 0.85 : 0.9;
    }
    
    if (columnCount > 10) {
      return 0.85;
    }
    
    if (columnCount > 8) {
      return 0.9;
    }
    
    return 1;
  }, [visibleColumns, containerWidth]);

  const tableStyle = useMemo(() => {
    const baseFontSize = 14;
    const scaledFontSize = Math.max(11, baseFontSize * fontSizeScale);
    const paddingScale = fontSizeScale < 0.9 ? Math.max(0.65, fontSizeScale * 0.9) : 1;
    
    const basePaddingX = 24;
    const basePaddingY = 16;
    
    return {
      fontSize: `${scaledFontSize}px`,
      '--cell-padding-x': `${Math.max(12, basePaddingX * paddingScale)}px`,
      '--cell-padding-y': `${Math.max(8, basePaddingY * paddingScale)}px`,
    } as React.CSSProperties & { '--cell-padding-x': string; '--cell-padding-y': string };
  }, [fontSizeScale]);

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingIndex(index);

    const startX = e.clientX;
    const startColumn = adjustedColumns[index];
    const startWidthPercent = (startColumn as { widthPercent?: number }).widthPercent || 
      (startColumn.width / baseTotalWidth) * 100;
    const nextIndex = index + 1;
    const nextColumn = nextIndex < adjustedColumns.length ? adjustedColumns[nextIndex] : null;
    const nextStartWidthPercent = nextColumn ? 
      ((nextColumn as { widthPercent?: number }).widthPercent || 
       (nextColumn.width / baseTotalWidth) * 100) : 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      if (containerWidth === 0) return;

      const diff = moveEvent.clientX - startX;
      const diffPercent = (diff / containerWidth) * 100;
      
      const newWidthPercent = Math.max(
        ((adjustedColumns[index].minWidth || 80) / containerWidth) * 100,
        startWidthPercent + diffPercent
      );
      
      const updatedColumns = localColumns.map(col => {
        if (col.key === adjustedColumns[index].key) {
          const newWidth = (newWidthPercent / 100) * containerWidth;
          return { ...col, width: newWidth };
        }
        if (nextColumn && col.key === nextColumn.key) {
          const nextNewWidthPercent = Math.max(
            ((nextColumn.minWidth || 80) / containerWidth) * 100,
            nextStartWidthPercent - diffPercent
          );
          const nextNewWidth = (nextNewWidthPercent / 100) * containerWidth;
          return { ...col, width: nextNewWidth };
        }
        return col;
      });

      setLocalColumns(updatedColumns);
      
      if (onColumnsResize) {
        onColumnsResize(updatedColumns);
      }
    };

    const handleMouseUp = () => {
      setResizingIndex(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="w-full flex flex-col border border-gray-200 rounded-lg overflow-hidden min-w-0" ref={tableRef}>
      <div className="w-full min-w-0" ref={containerRef}>
        <table className="border-collapse w-full" style={{ tableLayout: 'fixed', ...tableStyle }}>
          <thead>
            <tr className="bg-[#0053AD] text-white">
              {adjustedColumns.map((column, index) => {
                const alignClass = {
                  left: "text-left",
                  center: "text-center",
                  right: "text-right",
                }[column.align || "left"];

                const widthPercent = (column as { widthPercent?: number }).widthPercent || 
                  (baseTotalWidth > 0 ? (column.width / baseTotalWidth) * 100 : 100 / adjustedColumns.length);

                return (
                  <th
                    key={column.key}
                    className={`font-semibold relative ${alignClass}`}
                    style={{ 
                      width: `${widthPercent}%`,
                      paddingLeft: tableStyle['--cell-padding-x'],
                      paddingRight: tableStyle['--cell-padding-x'],
                      paddingTop: tableStyle['--cell-padding-y'],
                      paddingBottom: tableStyle['--cell-padding-y'],
                    }}
                  >
                    {column.key === 'checkbox' && renderHeaderCheckbox ? (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {renderHeaderCheckbox()}
                      </div>
                    ) : (
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {column.label}
                      </div>
                    )}
                    {column.key !== 'checkbox' && index < adjustedColumns.length - 1 && (
                      <>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1.5em] w-[2px] bg-white"></div>
                        <div
                          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 transition-colors"
                          onMouseDown={(e) => handleMouseDown(index, e)}
                          style={{
                            backgroundColor: resizingIndex === index ? 'rgba(59, 130, 246, 0.5)' : 'transparent'
                          }}
                        />
                      </>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={adjustedColumns.length} className="p-0">
                  {loadingComponent || (
                    <div className="px-6 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-[#0053AD]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang tải...
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={adjustedColumns.length} className="px-6 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => {
                const itemKey = (item as { studentId?: string }).studentId || `row-${idx}`;
                return (
                  <React.Fragment key={itemKey}>
                    {renderRow(item, adjustedColumns, {
                      paddingX: tableStyle['--cell-padding-x'],
                      paddingY: tableStyle['--cell-padding-y'],
                    })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
