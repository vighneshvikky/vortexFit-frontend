import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
  sessionType: 'consultation' | 'recurring' | null;
  isBreakTime: boolean;
}

interface DaySchedule {
  date: Date;
  dayName: string;
  slots: TimeSlot[];
  isWeekend: boolean;
  customRules?: DayRule;
}

interface DayRule {
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  slotDuration: number; // in minutes
  isWorkingDay: boolean;
}

interface ScheduleRules {
  weekdays: DayRule;
  weekends: DayRule;
  slotDuration: number; // global slot duration in minutes
}

@Component({
  selector: 'app-trainer-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="schedule-container">
      <div class="header">
        <h2 class="title">
          <i class="icon">🏋️‍♂️</i>
          Trainer Availability Schedule
        </h2>
        <p class="subtitle">Set your schedule rules and manage availability dynamically</p>
      </div>

      <!-- Schedule Rules Configuration -->
      <div class="rules-panel" [class.collapsed]="!showRulesPanel">
        <div class="rules-header" (click)="toggleRulesPanel()">
          <h3>Schedule Rules Configuration</h3>
          <span class="toggle-icon">{{ showRulesPanel ? '▼' : '▶' }}</span>
        </div>
        
        <div class="rules-content" *ngIf="showRulesPanel">
          <div class="global-settings">
            <h4>Global Settings</h4>
            <div class="form-group">
              <label>Default Slot Duration:</label>
              <select [(ngModel)]="scheduleRules.slotDuration" (change)="generateSchedule()">
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>
            </div>
          </div>

          <div class="day-rules">
            <div class="weekday-rules">
              <h4>Weekday Rules (Mon-Fri)</h4>
              <div class="rule-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Start Time:</label>
                    <input type="time" [(ngModel)]="scheduleRules.weekdays.startTime" (change)="generateSchedule()">
                  </div>
                  <div class="form-group">
                    <label>End Time:</label>
                    <input type="time" [(ngModel)]="scheduleRules.weekdays.endTime" (change)="generateSchedule()">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Break Start:</label>
                    <input type="time" [(ngModel)]="scheduleRules.weekdays.breakStart" (change)="generateSchedule()">
                  </div>
                  <div class="form-group">
                    <label>Break End:</label>
                    <input type="time" [(ngModel)]="scheduleRules.weekdays.breakEnd" (change)="generateSchedule()">
                  </div>
                </div>
                <div class="form-group">
                  <label>
                    <input type="checkbox" [(ngModel)]="scheduleRules.weekdays.isWorkingDay" (change)="generateSchedule()">
                    Working Days
                  </label>
                </div>
              </div>
            </div>

            <div class="weekend-rules">
              <h4>Weekend Rules (Sat-Sun)</h4>
              <div class="rule-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Start Time:</label>
                    <input type="time" [(ngModel)]="scheduleRules.weekends.startTime" (change)="generateSchedule()">
                  </div>
                  <div class="form-group">
                    <label>End Time:</label>
                    <input type="time" [(ngModel)]="scheduleRules.weekends.endTime" (change)="generateSchedule()">
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>Break Start:</label>
                    <input type="time" [(ngModel)]="scheduleRules.weekends.breakStart" (change)="generateSchedule()">
                  </div>
                  <div class="form-group">
                    <label>Break End:</label>
                    <input type="time" [(ngModel)]="scheduleRules.weekends.breakEnd" (change)="generateSchedule()">
                  </div>
                </div>
                <div class="form-group">
                  <label>
                    <input type="checkbox" [(ngModel)]="scheduleRules.weekends.isWorkingDay" (change)="generateSchedule()">
                    Working Weekends
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="quick-templates">
            <h4>Quick Templates</h4>
            <div class="template-buttons">
              <button class="template-btn" (click)="applyTemplate('standard')">Standard (9-6)</button>
              <button class="template-btn" (click)="applyTemplate('early')">Early Bird (6-3)</button>
              <button class="template-btn" (click)="applyTemplate('evening')">Evening (12-9)</button>
              <button class="template-btn" (click)="applyTemplate('flexible')">Flexible (8-8)</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Controls -->
      <div class="controls">
        <div class="date-picker">
          <label for="startDate">Start Date:</label>
          <input 
            type="date" 
            id="startDate"
            [(ngModel)]="selectedStartDate" 
            (change)="generateSchedule()"
            class="date-input"
          >
        </div>
        
        <div class="view-options">
          <label>
            <input 
              type="radio" 
              name="view" 
              value="week" 
              [(ngModel)]="viewMode"
              (change)="generateSchedule()"
            > Week View
          </label>
          <label>
            <input 
              type="radio" 
              name="view" 
              value="month" 
              [(ngModel)]="viewMode"
              (change)="generateSchedule()"
            > Month View
          </label>
        </div>

        <div class="bulk-actions">
          <button class="bulk-action-btn" (click)="toggleAllSlots()">
            {{ allSlotsEnabled ? 'Disable All' : 'Enable All' }}
          </button>
          <button class="bulk-action-btn secondary" (click)="resetToDefaults()">
            Reset to Rules
          </button>
        </div>
      </div>

      <!-- Schedule Display -->
      <div class="schedule-stats">
        <div class="stat-card">
          <div class="stat-number">{{ getTotalAvailableSlots() }}</div>
          <div class="stat-label">Available Slots</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ getTotalBookedSlots() }}</div>
          <div class="stat-label">Booked Sessions</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ getWorkingDays() }}</div>
          <div class="stat-label">Working Days</div>
        </div>
      </div>

      <div class="schedule-grid" [class.week-view]="viewMode === 'week'" [class.month-view]="viewMode === 'month'">
        <div 
          *ngFor="let day of schedule" 
          class="day-card"
          [class.weekend]="day.isWeekend"
          [class.today]="isToday(day.date)"
          [class.non-working]="!isWorkingDay(day)"
        >
          <div class="day-header">
            <h3 class="day-name">{{ day.dayName }}</h3>
            <p class="day-date">{{ formatDate(day.date) }}</p>
            <div class="day-info">
              <span class="working-hours" *ngIf="isWorkingDay(day)">
                {{ getWorkingHours(day) }}
              </span>
              <span class="non-working-label" *ngIf="!isWorkingDay(day)">
                Non-Working Day
              </span>
            </div>
            <div class="day-stats" *ngIf="isWorkingDay(day)">
              <span class="available-count">{{ getAvailableCount(day) }} available</span>
              <span class="booked-count">{{ getBookedCount(day) }} booked</span>
            </div>
          </div>

          <div class="slots-container" *ngIf="isWorkingDay(day)">
            <div 
              *ngFor="let slot of day.slots" 
              class="time-slot"
              [class.available]="slot.isAvailable && !slot.isBooked && !slot.isBreakTime"
              [class.unavailable]="!slot.isAvailable && !slot.isBooked && !slot.isBreakTime"
              [class.booked]="slot.isBooked"
              [class.break-time]="slot.isBreakTime"
              [class.consultation]="slot.sessionType === 'consultation'"
              [class.recurring]="slot.sessionType === 'recurring'"
              (click)="toggleSlot(day, slot)"
            >
              <div class="slot-time">{{ slot.time }}</div>
              <div class="slot-status">
                <span *ngIf="slot.isBreakTime" class="break-label">🍽️ Break</span>
                <span *ngIf="slot.isBooked && slot.sessionType === 'consultation'" class="session-type">
                  📋 Consultation
                </span>
                <span *ngIf="slot.isBooked && slot.sessionType === 'recurring'" class="session-type">
                  🔄 Recurring
                </span>
                <span *ngIf="slot.isAvailable && !slot.isBooked && !slot.isBreakTime" class="status-available">
                  ✅ Available
                </span>
                <span *ngIf="!slot.isAvailable && !slot.isBooked && !slot.isBreakTime" class="status-unavailable">
                  ❌ Unavailable
                </span>
              </div>
            </div>
          </div>

          <div class="day-actions" *ngIf="isWorkingDay(day)">
            <button 
              class="day-toggle-btn"
              (click)="toggleDaySlots(day)"
            >
              {{ isDayFullyAvailable(day) ? 'Disable Day' : 'Enable Day' }}
            </button>
          </div>
        </div>
      </div>

      <div class="legend">
        <h4>Legend:</h4>
        <div class="legend-items">
          <div class="legend-item">
            <div class="legend-color available"></div>
            <span>Available</span>
          </div>
          <div class="legend-item">
            <div class="legend-color unavailable"></div>
            <span>Unavailable</span>
          </div>
          <div class="legend-item">
            <div class="legend-color break-time"></div>
            <span>Break Time</span>
          </div>
          <div class="legend-item">
            <div class="legend-color consultation"></div>
            <span>Consultation</span>
          </div>
          <div class="legend-item">
            <div class="legend-color recurring"></div>
            <span>Recurring Session</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .schedule-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d1810 100%);
      min-height: 100vh;
      color: #fff;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%);
      border-radius: 15px;
      box-shadow: 0 8px 32px rgba(220, 38, 38, 0.3);
    }

    .title {
      margin: 0 0 10px 0;
      font-size: 2.5rem;
      font-weight: 700;
      color: #fff;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .icon {
      margin-right: 10px;
      font-size: 2rem;
    }

    .subtitle {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
      font-weight: 300;
    }

    /* Rules Panel */
    .rules-panel {
      background: rgba(220, 38, 38, 0.1);
      border: 1px solid rgba(220, 38, 38, 0.3);
      border-radius: 12px;
      margin-bottom: 30px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .rules-header {
      padding: 15px 20px;
      background: rgba(220, 38, 38, 0.2);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
    }

    .rules-header h3 {
      margin: 0;
      color: #f87171;
      font-size: 1.2rem;
    }

    .toggle-icon {
      color: #f87171;
      font-size: 1.2rem;
      transition: transform 0.3s ease;
    }

    .rules-content {
      padding: 20px;
    }

    .global-settings {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(220, 38, 38, 0.2);
    }

    .global-settings h4 {
      margin: 0 0 15px 0;
      color: #fca5a5;
      font-size: 1.1rem;
    }

    .day-rules {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 25px;
    }

    .weekday-rules, .weekend-rules {
      background: rgba(0, 0, 0, 0.2);
      padding: 20px;
      border-radius: 8px;
      border: 1px solid rgba(220, 38, 38, 0.2);
    }

    .weekday-rules h4, .weekend-rules h4 {
      margin: 0 0 15px 0;
      color: #f87171;
      font-size: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .form-group label {
      font-size: 0.9rem;
      color: #fca5a5;
      font-weight: 500;
    }

    .form-group input[type="time"],
    .form-group select {
      padding: 8px 12px;
      border: 1px solid rgba(220, 38, 38, 0.3);
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.3);
      color: #fff;
      font-size: 14px;
    }

    .form-group input[type="time"]:focus,
    .form-group select:focus {
      outline: none;
      border-color: #f87171;
      box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.2);
    }

    .form-group input[type="checkbox"] {
      width: auto;
      margin-right: 8px;
      accent-color: #dc2626;
    }

    .quick-templates {
      padding-top: 20px;
      border-top: 1px solid rgba(220, 38, 38, 0.2);
    }

    .quick-templates h4 {
      margin: 0 0 15px 0;
      color: #fca5a5;
      font-size: 1rem;
    }

    .template-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .template-btn {
      padding: 8px 16px;
      background: rgba(220, 38, 38, 0.2);
      border: 1px solid rgba(220, 38, 38, 0.3);
      border-radius: 6px;
      color: #f87171;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .template-btn:hover {
      background: rgba(220, 38, 38, 0.3);
      transform: translateY(-1px);
    }

    /* Controls */
    .controls {
      display: flex;
      gap: 20px;
      align-items: center;
      margin-bottom: 20px;
      padding: 20px;
      background: rgba(220, 38, 38, 0.1);
      border-radius: 10px;
      border: 1px solid rgba(220, 38, 38, 0.3);
      flex-wrap: wrap;
    }

    .date-picker {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .date-picker label {
      font-weight: 600;
      color: #f87171;
    }

    .date-input {
      padding: 8px 12px;
      border: 2px solid #dc2626;
      border-radius: 6px;
      background: rgba(0, 0, 0, 0.3);
      color: #fff;
      font-size: 14px;
    }

    .view-options {
      display: flex;
      gap: 15px;
    }

    .view-options label {
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      color: #f87171;
      font-weight: 500;
    }

    .bulk-actions {
      display: flex;
      gap: 10px;
    }

    .bulk-action-btn {
      padding: 10px 20px;
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    }

    .bulk-action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
    }

    .bulk-action-btn.secondary {
      background: linear-gradient(135deg, rgba(220, 38, 38, 0.3), rgba(185, 28, 28, 0.3));
      border: 1px solid rgba(220, 38, 38, 0.5);
    }

    /* Stats */
    .schedule-stats {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      justify-content: center;
    }

    .stat-card {
      background: rgba(220, 38, 38, 0.1);
      border: 1px solid rgba(220, 38, 38, 0.3);
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      min-width: 120px;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #f87171;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #fca5a5;
      margin-top: 5px;
    }

    /* Schedule Grid */
    .schedule-grid {
      display: grid;
      gap: 20px;
      margin-bottom: 30px;
    }

    .schedule-grid.week-view {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    .schedule-grid.month-view {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }

    .day-card {
      background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(185, 28, 28, 0.1) 100%);
      border: 1px solid rgba(220, 38, 38, 0.3);
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .day-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(220, 38, 38, 0.2);
      border-color: rgba(220, 38, 38, 0.5);
    }

    .day-card.non-working {
      opacity: 0.6;
      background: linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(75, 85, 99, 0.1) 100%);
      border-color: rgba(107, 114, 128, 0.3);
    }

    .day-card.today {
      border: 2px solid #f87171;
      box-shadow: 0 0 20px rgba(248, 113, 113, 0.3);
    }

    .day-header {
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(220, 38, 38, 0.3);
    }

    .day-name {
      margin: 0 0 5px 0;
      font-size: 1.3rem;
      font-weight: 700;
      color: #f87171;
    }

    .day-date {
      margin: 0 0 10px 0;
      color: #fca5a5;
      font-size: 0.9rem;
    }

    .day-info {
      margin-bottom: 10px;
    }

    .working-hours {
      background: rgba(16, 185, 129, 0.2);
      color: #6ee7b7;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .non-working-label {
      background: rgba(107, 114, 128, 0.2);
      color: #d1d5db;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .day-stats {
      display: flex;
      gap: 15px;
      font-size: 0.8rem;
    }

    .available-count {
      color: #10b981;
      font-weight: 600;
    }

    .booked-count {
      color: #f59e0b;
      font-weight: 600;
    }

    .slots-container {
      display: grid;
      gap: 8px;
      margin-bottom: 15px;
      max-height: 400px;
      overflow-y: auto;
    }

    .time-slot {
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .time-slot:hover {
      transform: scale(1.02);
    }

    .time-slot.available {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2));
      border-color: rgba(16, 185, 129, 0.3);
      color: #6ee7b7;
    }

    .time-slot.unavailable {
      background: linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(75, 85, 99, 0.2));
      border-color: rgba(107, 114, 128, 0.3);
      color: #d1d5db;
    }

    .time-slot.break-time {
      background: linear-gradient(135deg, rgba(245, 101, 101, 0.2), rgba(239, 68, 68, 0.2));
      border-color: rgba(245, 101, 101, 0.3);
      color: #fca5a5;
      cursor: default;
    }

    .time-slot.booked {
      cursor: default;
    }

    .time-slot.consultation {
      background: linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(126, 34, 206, 0.2));
      border-color: rgba(147, 51, 234, 0.3);
      color: #c4b5fd;
    }

    .time-slot.recurring {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2));
      border-color: rgba(245, 158, 11, 0.3);
      color: #fcd34d;
    }

    .slot-time {
      font-weight: 600;
      font-size: 1rem;
    }

    .slot-status {
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .break-label {
      font-weight: 600;
      color: #fca5a5;
    }

    .day-actions {
      text-align: center;
    }

    .day-toggle-btn {
      padding: 8px 16px;
      background: rgba(220, 38, 38, 0.2);
      color: #f87171;
      border: 1px solid rgba(220, 38, 38, 0.3);
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .day-toggle-btn:hover {
      background: rgba(220, 38, 38, 0.3);
      border-color: rgba(220, 38, 38, 0.5);
    }

    /* Legend */
    .legend {
      background: rgba(220, 38, 38, 0.1);
      border: 1px solid rgba(220, 38, 38, 0.3);
      border-radius: 10px;
      padding: 20px;
    }

    .legend h4 {
      margin: 0 0 15px 0;
      color: #f87171;
      font-size: 1.1rem;
    }

    .legend-items {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
    }

    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .legend-color.available {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(5, 150, 105, 0.8));
    }

    .legend-color.unavailable {
      background: linear-gradient(135deg, rgba(107, 114, 128, 0.8), rgba(75, 85, 99, 0.8));
    }

    .legend-color.break-time {
      background: linear-gradient(135deg, rgba(245, 101, 101, 0.8), rgba(239, 68, 68, 0.8));
    }

    .legend-color.consultation {
      background: linear-gradient(135deg, rgba(147, 51, 234, 0.8), rgba(126, 34, 206, 0.8));
    }

    .legend-color.recurring {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.8), rgba(217, 119, 6, 0.8));
    }

    @media (max-width: 1024px) {
      .day-rules {
        grid-template-columns: 1fr;
      }
    }

          @media (max-width: 768px) {
      .schedule-container {
        padding: 15px;
      }
      
      .title {
        font-size: 2rem;
      }
      
      .controls {
        flex-direction: column;
        align-items: stretch;
      }
      
      .view-options {
        justify-content: center;
      }
      
      .schedule-grid {
        grid-template-columns: 1fr;
      }
      
      .schedule-stats {
        flex-wrap: wrap;
      }
      
      .legend-items {
        justify-content: center;
      }
      
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .template-buttons {
        justify-content: center;
      }
    }
  `]
})
export class TrainerScheduleComponent implements OnInit {
  schedule: DaySchedule[] = [];
  selectedStartDate: string = '';
  viewMode: 'week' | 'month' = 'week';
  allSlotsEnabled: boolean = false;
  showRulesPanel: boolean = true;

  scheduleRules: ScheduleRules = {
    slotDuration: 60,
    weekdays: {
      startTime: '09:00',
      endTime: '18:00',
      breakStart: '12:00',
      breakEnd: '13:00',
      slotDuration: 60,
      isWorkingDay: true
    },
    weekends: {
      startTime: '10:00',
      endTime: '16:00',
      breakStart: '13:00',
      breakEnd: '14:00',
      slotDuration: 60,
      isWorkingDay: false
    }
  };

  // Mock booked sessions - in real app, this would come from API
  private mockBookedSessions = [
    { date: '2024-08-05', time: '09:00', type: 'consultation' as const },
    { date: '2024-08-05', time: '15:00', type: 'recurring' as const },
    { date: '2024-08-06', time: '10:00', type: 'recurring' as const },
    { date: '2024-08-07', time: '14:00', type: 'consultation' as const },
  ];

  ngOnInit() {
    const today = new Date();
    this.selectedStartDate = today.toISOString().split('T')[0];
    this.generateSchedule();
  }

  toggleRulesPanel() {
    this.showRulesPanel = !this.showRulesPanel;
  }

  applyTemplate(template: string) {
    switch (template) {
      case 'standard':
        this.scheduleRules.weekdays = {
          startTime: '09:00',
          endTime: '18:00',
          breakStart: '12:00',
          breakEnd: '13:00',
          slotDuration: 60,
          isWorkingDay: true
        };
        this.scheduleRules.weekends = {
          startTime: '10:00',
          endTime: '16:00',
          breakStart: '13:00',
          breakEnd: '14:00',
          slotDuration: 60,
          isWorkingDay: false
        };
        break;
      case 'early':
        this.scheduleRules.weekdays = {
          startTime: '06:00',
          endTime: '15:00',
          breakStart: '10:00',
          breakEnd: '10:30',
          slotDuration: 60,
          isWorkingDay: true
        };
        this.scheduleRules.weekends = {
          startTime: '07:00',
          endTime: '12:00',
          breakStart: '09:30',
          breakEnd: '10:00',
          slotDuration: 60,
          isWorkingDay: true
        };
        break;
      case 'evening':
        this.scheduleRules.weekdays = {
          startTime: '12:00',
          endTime: '21:00',
          breakStart: '17:00',
          breakEnd: '18:00',
          slotDuration: 60,
          isWorkingDay: true
        };
        this.scheduleRules.weekends = {
          startTime: '14:00',
          endTime: '20:00',
          breakStart: '17:00',
          breakEnd: '17:30',
          slotDuration: 60,
          isWorkingDay: true
        };
        break;
      case 'flexible':
        this.scheduleRules.weekdays = {
          startTime: '08:00',
          endTime: '20:00',
          breakStart: '13:00',
          breakEnd: '14:00',
          slotDuration: 60,
          isWorkingDay: true
        };
        this.scheduleRules.weekends = {
          startTime: '09:00',
          endTime: '18:00',
          breakStart: '13:00',
          breakEnd: '14:00',
          slotDuration: 60,
          isWorkingDay: true
        };
        break;
    }
    this.generateSchedule();
  }

  generateSchedule() {
    const startDate = new Date(this.selectedStartDate);
    const daysToShow = this.viewMode === 'week' ? 7 : 30;
    
    this.schedule = [];

    for (let i = 0; i < daysToShow; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const daySchedule: DaySchedule = {
        date: currentDate,
        dayName: this.getDayName(currentDate),
        slots: this.generateSlotsForDay(currentDate),
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6
      };

      this.schedule.push(daySchedule);
    }

    this.updateAllSlotsStatus();
  }

  private generateSlotsForDay(date: Date): TimeSlot[] {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const dayRule = isWeekend ? this.scheduleRules.weekends : this.scheduleRules.weekdays;
    
    if (!dayRule.isWorkingDay) {
      return [];
    }

    const slots: TimeSlot[] = [];
    const dateString = date.toISOString().split('T')[0];
    
    const startTime = this.timeToMinutes(dayRule.startTime);
    const endTime = this.timeToMinutes(dayRule.endTime);
    const breakStart = this.timeToMinutes(dayRule.breakStart);
    const breakEnd = this.timeToMinutes(dayRule.breakEnd);
    const slotDuration = this.scheduleRules.slotDuration;

    for (let time = startTime; time < endTime; time += slotDuration) {
      const timeString = this.minutesToTime(time);
      const isBreakTime = time >= breakStart && time < breakEnd;
      
      // Check if this slot is booked
      const bookedSession = this.mockBookedSessions.find(
        session => session.date === dateString && session.time === timeString
      );

      slots.push({
        id: `${dateString}-${timeString}`,
        time: timeString,
        isAvailable: !bookedSession && !isBreakTime,
        isBooked: !!bookedSession,
        sessionType: bookedSession?.type || null,
        isBreakTime: isBreakTime
      });
    }

    return slots;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  toggleSlot(day: DaySchedule, slot: TimeSlot) {
    if (slot.isBooked || slot.isBreakTime) return;
    
    slot.isAvailable = !slot.isAvailable;
    this.updateAllSlotsStatus();
  }

  toggleDaySlots(day: DaySchedule) {
    const availableSlots = day.slots.filter(slot => !slot.isBooked && !slot.isBreakTime);
    const shouldEnable = !this.isDayFullyAvailable(day);
    
    availableSlots.forEach(slot => {
      slot.isAvailable = shouldEnable;
    });
    
    this.updateAllSlotsStatus();
  }

  toggleAllSlots() {
    const newStatus = !this.allSlotsEnabled;
    
    this.schedule.forEach(day => {
      day.slots.forEach(slot => {
        if (!slot.isBooked && !slot.isBreakTime) {
          slot.isAvailable = newStatus;
        }
      });
    });
    
    this.updateAllSlotsStatus();
  }

  resetToDefaults() {
    this.generateSchedule();
  }

  private updateAllSlotsStatus() {
    const allAvailableSlots = this.schedule
      .flatMap(day => day.slots)
      .filter(slot => !slot.isBooked && !slot.isBreakTime);
    
    this.allSlotsEnabled = allAvailableSlots.length > 0 && 
      allAvailableSlots.every(slot => slot.isAvailable);
  }

  isDayFullyAvailable(day: DaySchedule): boolean {
    const availableSlots = day.slots.filter(slot => !slot.isBooked && !slot.isBreakTime);
    return availableSlots.length > 0 && availableSlots.every(slot => slot.isAvailable);
  }

  isWorkingDay(day: DaySchedule): boolean {
    const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
    const dayRule = isWeekend ? this.scheduleRules.weekends : this.scheduleRules.weekdays;
    return dayRule.isWorkingDay;
  }

  getWorkingHours(day: DaySchedule): string {
    const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
    const dayRule = isWeekend ? this.scheduleRules.weekends : this.scheduleRules.weekdays;
    return `${dayRule.startTime} - ${dayRule.endTime}`;
  }

  getAvailableCount(day: DaySchedule): number {
    return day.slots.filter(slot => slot.isAvailable && !slot.isBooked && !slot.isBreakTime).length;
  }

  getBookedCount(day: DaySchedule): number {
    return day.slots.filter(slot => slot.isBooked).length;
  }

  getTotalAvailableSlots(): number {
    return this.schedule
      .flatMap(day => day.slots)
      .filter(slot => slot.isAvailable && !slot.isBooked && !slot.isBreakTime).length;
  }

  getTotalBookedSlots(): number {
    return this.schedule
      .flatMap(day => day.slots)
      .filter(slot => slot.isBooked).length;
  }

  getWorkingDays(): number {
    return this.schedule.filter(day => this.isWorkingDay(day)).length;
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
}



