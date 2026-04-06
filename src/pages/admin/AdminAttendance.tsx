import React, { useEffect, useState, useMemo } from 'react';
import { getAttendance, getInterns } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import * as XLSX from 'xlsx';

type AdminAttendanceRecord = { id: string; internId: string; date?: string; status: 'present' | 'absent' | string; checkIn?: string };

type InternInfo = { id: string; name: string; group: string };

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState<AdminAttendanceRecord[]>([]);
  const [interns, setInterns] = useState<InternInfo[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchName, setSearchName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showInternsModal, setShowInternsModal] = useState<boolean>(false);
  const [internsSearchFilter, setInternsSearchFilter] = useState<string>('');
  const [selectedInterns, setSelectedInterns] = useState<Set<string>>(new Set());

  const statusVariant = (s: string) => s === 'present' ? 'default' : 'destructive';

  useEffect(() => {
    (async () => {
      try {
        const [a, i] = await Promise.all([getAttendance(), getInterns()]);
        setAttendance((a as AdminAttendanceRecord[]).map(item => ({
          ...item,
          status: item.status === 'late' ? 'present' : item.status
        })));
        setInterns(i as InternInfo[]);
      } catch (err) {
        if (err instanceof Error) {
          console.error('Failed to load attendance', err.message);
        } else {
          console.error('Failed to load attendance', err);
        }
      }
    })();
  }, []);

  // Get unique groups sorted
  const groups = useMemo(() => {
    const uniqueGroups = [...new Set(interns.map(i => i.group))].sort();
    return uniqueGroups.filter(g => g); // Filter out empty/null groups
  }, [interns]);

  // Get interns filtered by selected group
  const internsFilteredByGroup = useMemo(() => {
    if (selectedGroup === 'all') {
      return interns;
    }
    return interns.filter(i => i.group === selectedGroup);
  }, [interns, selectedGroup]);

  // Get interns with attendance records
  const internsWithAttendance = useMemo(() => {
    return new Set(attendance.map(a => a.internId));
  }, [attendance]);

  // Filter interns for modal
  const filteredInterns = useMemo(() => {
    return internsFilteredByGroup.filter(i =>
      i.name.toLowerCase().includes(internsSearchFilter.toLowerCase()) ||
      i.id.toLowerCase().includes(internsSearchFilter.toLowerCase())
    );
  }, [internsFilteredByGroup, internsSearchFilter]);

  // Filter attendance data based on selections
  const filteredAttendance = useMemo(() => {
    return attendance.filter(a => {
      const intern = interns.find(i => i.id === a.internId);
      if (!intern) return false;

      // Filter by selected interns
      if (selectedInterns.size > 0 && !selectedInterns.has(a.internId)) return false;

      // Filter by group
      if (selectedGroup !== 'all' && intern.group !== selectedGroup) return false;

      // Filter by name
      if (searchName && !intern.name.toLowerCase().includes(searchName.toLowerCase())) return false;

      // Filter by date range
      if (a.date) {
        const aDate = a.date;
        if (aDate < startDate || aDate > endDate) return false;
      }

      return true;
    });
  }, [attendance, interns, selectedGroup, searchName, startDate, endDate, selectedInterns]);

  // Group filtered data by group for display
  const groupedData = useMemo(() => {
    const grouped: Record<string, AdminAttendanceRecord[]> = {};
    filteredAttendance.forEach(a => {
      const intern = interns.find(i => i.id === a.internId);
      const group = intern?.group || 'No Group';
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(a);
    });
    return grouped;
  }, [filteredAttendance, interns]);

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Check if filtered attendance exists, if not check all attendance within date range
    let dataToExport = filteredAttendance;
    
    // If no filtered data but attendance exists outside filters, still filter by date range
    if (dataToExport.length === 0) {
      dataToExport = attendance.filter(a => {
        if (!a.date) return false;
        const aDate = a.date;
        return aDate >= startDate && aDate <= endDate;
      });
    }

    if (dataToExport.length === 0) {
      alert('⚠️ No attendance marked till date\n\nNo attendance records found for the selected date range:\n' + startDate + ' to ' + endDate);
      return;
    }

    // Group data by group for export
    const groupedForExport: Record<string, AdminAttendanceRecord[]> = {};
    dataToExport.forEach(a => {
      const intern = interns.find(i => i.id === a.internId);
      const group = intern?.group || 'No Group';
      if (!groupedForExport[group]) {
        groupedForExport[group] = [];
      }
      groupedForExport[group].push(a);
    });

    // Create sheets for each group
    Object.keys(groupedForExport).sort().forEach(group => {
      const groupAttendance = groupedForExport[group];
      
      const data = groupAttendance.map(a => {
        const intern = interns.find(i => i.id === a.internId);
          return {
            'Intern ID': a.internId,
          'Date': a.date || '',
          'Status': a.status,
          'Check In': a.checkIn || '—'
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 15 },  // Intern ID
        { wch: 20 },  // Name
        { wch: 15 },  // Group
        { wch: 12 },  // Date
        { wch: 12 },  // Status
        { wch: 15 }   // Check In
      ];

      // Format all Intern ID cells as text to preserve leading zeros and exact format
      for (let i = 2; i <= data.length + 1; i++) {
        const cellRef = 'A' + i;
        if (ws[cellRef]) {
          // Set cell type to string
          ws[cellRef].t = 's';
          // Set number format to text
          ws[cellRef].z = '@';
          // Ensure value is stored as string
          ws[cellRef].v = String(ws[cellRef].v);
        }
      }

      XLSX.utils.book_append_sheet(wb, ws, group.substring(0, 31));
    });

    // Add summary sheet
    const summaryData = Object.entries(groupedForExport).map(([group, records]) => {
      const presentCount = records.filter(r => r.status === 'present').length;
      const absentCount = records.filter(r => r.status === 'absent').length;
      
      return {
        'Group': group,
        'Total': records.length,
        'Present': presentCount,
        'Absent': absentCount,
        'Attendance %': records.length > 0 ? ((presentCount / records.length) * 100).toFixed(2) + '%' : '0%'
      };
    });

    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 }
    ];
    
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    const fileName = `attendance-${startDate}-to-${endDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const toggleInternSelection = (internId: string) => {
    const newSelected = new Set(selectedInterns);
    if (newSelected.has(internId)) {
      newSelected.delete(internId);
    } else {
      newSelected.add(internId);
    }
    setSelectedInterns(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedInterns.size === filteredInterns.length) {
      setSelectedInterns(new Set());
    } else {
      const allIds = new Set(filteredInterns.map(i => i.id));
      setSelectedInterns(allIds);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance Tracking</h1>
        <p className="text-muted-foreground mt-1">Monitor intern attendance records by group</p>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Group Selector */}
            <div className="space-y-2">
              <label htmlFor="groupSelect" className="text-sm font-medium text-foreground">
                Group
              </label>
              <Select value={selectedGroup} onValueChange={(value) => {
                setSelectedGroup(value);
                setSelectedInterns(new Set()); // Clear selected interns when group changes
              }}>
                <SelectTrigger id="groupSelect">
                  <SelectValue placeholder="All Groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map(group => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Select Interns Popover */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Select Interns
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="truncate">
                      {selectedInterns.size === 0 ? 'Choose interns...' : `${selectedInterns.size} selected`}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="space-y-2 p-4">
                    {/* Search */}
                    <Input
                      placeholder="Search by name or ID..."
                      value={internsSearchFilter}
                      onChange={e => setInternsSearchFilter(e.target.value)}
                      className="mb-2"
                    />

                    {/* Select All */}
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Checkbox
                        checked={filteredInterns.length > 0 && selectedInterns.size === filteredInterns.length}
                        onCheckedChange={toggleSelectAll}
                      />
                      <label className="text-sm font-medium cursor-pointer flex-1">
                        Select All ({filteredInterns.length})
                      </label>
                    </div>

                    {/* Scrollable Interns List */}
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-1 pr-4">
                        {filteredInterns.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            No interns found
                          </p>
                        ) : (
                          filteredInterns.map(intern => (
                            <div
                              key={intern.id}
                              className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                              onClick={() => toggleInternSelection(intern.id)}
                            >
                              <Checkbox
                                checked={selectedInterns.has(intern.id)}
                                onCheckedChange={() => toggleInternSelection(intern.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{intern.name}</p>
                                <p className="text-xs text-muted-foreground truncate">ID: {intern.id}</p>
                              </div>
                              {internsWithAttendance.has(intern.id) && (
                                <Badge variant="secondary" className="ml-1 text-xs">
                                  Has Records
                                </Badge>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium text-foreground">
                From Date
              </label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label htmlFor="endDate" className="text-sm font-medium text-foreground">
                To Date
              </label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>

            {/* View All Interns Button */}
            <div className="space-y-2 flex flex-col justify-end">
              <Button 
                onClick={() => setShowInternsModal(true)} 
                variant="outline"
                className="w-full"
              >
                View All Interns
              </Button>
            </div>

            {/* Download Button */}
            <div className="space-y-2 flex flex-col justify-end">
              <Button 
                onClick={downloadExcel} 
                className="w-full"
              >
                Download Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {selectedInterns.size > 0 && (
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Selected Interns</p>
                <p className="text-2xl font-bold text-blue-600">{selectedInterns.size}</p>
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold text-foreground">{filteredAttendance.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="text-2xl font-bold text-green-600">{filteredAttendance.filter(a => a.status === 'present').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="text-2xl font-bold text-red-600">{filteredAttendance.filter(a => a.status === 'absent').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Attendance %</p>
              <p className="text-2xl font-bold text-foreground">
                {filteredAttendance.length > 0 ? ((filteredAttendance.filter(a => a.status === 'present').length / filteredAttendance.length) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table with Scrollable Groups */}
      <ScrollArea className="h-[600px] rounded-lg border">
        <div className="p-4">
          {Object.keys(groupedData).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <div className="text-center space-y-4 max-w-md">
                <div className="text-4xl">⚠️</div>
                <h3 className="font-semibold text-lg text-foreground">No Attendance Marked Till Date</h3>
                <p className="text-sm text-muted-foreground">
                  No attendance records found for the selected filters:
                </p>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg text-sm">
                  <p className="text-amber-900 dark:text-amber-100">
                    <strong>Date Range:</strong> {startDate} to {endDate}
                  </p>
                  {selectedGroup !== 'all' && (
                    <p className="text-amber-900 dark:text-amber-100 mt-2">
                      <strong>Group:</strong> {selectedGroup}
                    </p>
                  )}
                  {selectedInterns.size > 0 && (
                    <p className="text-amber-900 dark:text-amber-100 mt-2">
                      <strong>Selected Interns:</strong> {selectedInterns.size}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your date range, group selection, or intern filters
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedData).sort().map(group => (
                <div key={group} className="space-y-2">
                  <div className="sticky top-0 bg-background py-2 font-semibold text-lg text-foreground border-b-2 border-primary">
                    {group}
                    <span className="text-sm text-muted-foreground ml-2">
                      ({groupedData[group].length} records)
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Check In</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedData[group].map(a => {
                          const intern = interns.find(i => i.id === a.internId);
                          return (
                            <TableRow key={a.id}>
                              <TableCell className="font-medium text-foreground">{a.internId}</TableCell>
                              <TableCell className="text-foreground">{intern?.name || 'Unknown'}</TableCell>
                              <TableCell className="text-muted-foreground">{a.date}</TableCell>
                              <TableCell>
                                <Badge variant={statusVariant(a.status)}>
                                  {a.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{a.checkIn || '—'}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Interns Modal Dialog */}
      <Dialog open={showInternsModal} onOpenChange={setShowInternsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedGroup === 'all' ? 'All Interns' : `Interns - ${selectedGroup}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 text-sm">
              <p className="text-blue-900 dark:text-blue-100">
                💡 Tip: Use the <strong>"Select Interns"</strong> dropdown in the filters to select specific interns for attendance export
              </p>
            </div>

            {/* Scrollable Interns List */}
            <ScrollArea className="h-[500px] rounded-lg border p-4">
              <div className="space-y-2 pr-4">
                {internsFilteredByGroup.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    No interns found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {internsFilteredByGroup.map(intern => {
                      const hasAttendance = internsWithAttendance.has(intern.id);
                      const isSelected = selectedInterns.has(intern.id);
                      return (
                        <div
                          key={intern.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700'
                              : hasAttendance
                              ? 'bg-green-50 border-green-300 dark:bg-green-950/20 dark:border-green-700'
                              : 'bg-background border-muted hover:bg-accent'
                          }`}
                          onClick={() => toggleInternSelection(intern.id)}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleInternSelection(intern.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{intern.name}</p>
                              <p className="text-sm text-muted-foreground">ID: {intern.id}</p>
                              <p className="text-sm text-muted-foreground">Group: {intern.group}</p>
                            </div>
                            {isSelected && (
                              <Badge variant="default" className="ml-2 text-xs">
                                Selected
                              </Badge>
                            )}
                            {hasAttendance && !isSelected && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Has Records
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <Card>
                <CardContent className="pt-3">
                  <div className="text-center">
                    <p className="text-muted-foreground text-xs">Total Interns</p>
                    <p className="text-lg font-bold text-foreground">{internsFilteredByGroup.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-3">
                  <div className="text-center">
                    <p className="text-muted-foreground text-xs">With Attendance</p>
                    <p className="text-lg font-bold text-green-600">
                      {internsFilteredByGroup.filter(i => internsWithAttendance.has(i.id)).length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-3">
                  <div className="text-center">
                    <p className="text-muted-foreground text-xs">Selected</p>
                    <p className="text-lg font-bold text-blue-600">{selectedInterns.size}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAttendance;
