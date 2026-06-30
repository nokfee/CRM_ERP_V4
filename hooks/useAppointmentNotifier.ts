import { useEffect, useState, useMemo, useRef } from 'react';
import { Appointment, Customer } from '@/types';
import { useToast } from '@/components/Toast';

interface UseAppointmentNotifierProps {
  appointments: Appointment[];
  customers: Customer[];
  notifyMinutesBefore?: number;
}

export function useAppointmentNotifier({
  appointments,
  customers,
  notifyMinutesBefore = 15,
}: UseAppointmentNotifierProps) {
  const { toast } = useToast();
  const [approachingCount, setApproachingCount] = useState(0);
  const [approachingCustomerIds, setApproachingCustomerIds] = useState<string[]>([]);
  const notifiedIds = useRef<Set<number>>(new Set());

  // Create a customer map for quick lookup
  const customerMap = useMemo(() => {
    const map = new Map<string, Customer>();
    customers.forEach(c => map.set(String(c.id), c));
    return map;
  }, [customers]);

  useEffect(() => {
    // We only care about pending appointments
    const pendingAppointments = appointments.filter((a) => a.status !== 'เสร็จสิ้น');
    if (pendingAppointments.length === 0) {
      setApproachingCount(0);
      setApproachingCustomerIds([]);
      return;
    }

    const checkAppointments = () => {
      const now = new Date();
      const nowMs = now.getTime();
      let count = 0;
      const currentApproachingIds: string[] = [];

      pendingAppointments.forEach((apt) => {
        const aptDate = new Date(apt.date);
        const aptMs = aptDate.getTime();
        
        // Time difference in minutes
        const diffMinutes = (aptMs - nowMs) / (1000 * 60);

        // Check if the appointment is within the notification window (e.g. 0 to 15 mins away)
        // Also alert if it's recently overdue (e.g., up to 5 mins past)
        if (diffMinutes <= notifyMinutesBefore && diffMinutes >= -5) {
          // Verify customer belongs to this agent
          if (customerMap.has(String(apt.customerId))) {
            count++;
            if (!currentApproachingIds.includes(String(apt.customerId))) {
              currentApproachingIds.push(String(apt.customerId));
            }

            // Toast notification logic
            if (!notifiedIds.current.has(apt.id)) {
              const customer = customerMap.get(String(apt.customerId));
              const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'ลูกค้า';
              const customerPhone = customer ? customer.phone : '';
              
              const timeString = aptDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
              const isOverdue = diffMinutes < 0;
              
              const title = isOverdue ? '⚠️ ถึงเวลานัดหมายแล้ว!' : '⏰ นัดหมายใกล้ถึงในอีกไม่ช้า';
              const message = `นัดหมาย: ${customerName} ${customerPhone ? `(${customerPhone})` : ''}\nเวลา: ${timeString}\nเรื่อง: ${apt.title}`;
              
              toast(
                isOverdue ? 'error' : 'warning',
                title,
                message,
                8000
              );

              notifiedIds.current.add(apt.id);
            }
          }
        }
      });
      
      setApproachingCount(count);
      setApproachingCustomerIds(prev => {
        if (prev.length !== currentApproachingIds.length) return currentApproachingIds;
        const isSame = prev.every((id, idx) => id === currentApproachingIds[idx]);
        return isSame ? prev : currentApproachingIds;
      });
    };

    // Run immediately on mount or dependency change
    checkAppointments();

    // Then run every 1 minute
    const intervalId = setInterval(checkAppointments, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, [appointments, customerMap, notifyMinutesBefore, toast, customers]);

  return {
    hasApproachingAppointment: approachingCount > 0,
    approachingCount,
    approachingCustomerIds
  };
}
