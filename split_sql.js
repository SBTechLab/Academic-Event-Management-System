const fs = require('fs');
const path = require('path');

const srcDir = 'd:/New folder (3)/Academic-Event-Management-System/database_sql';
const destDir = 'd:/New folder (3)/Academic-Event-Management-System/database_sql_by_role';

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.sql') && f !== 'clean_sql_comments.js');

let allSql = '';
for (const f of files) {
    allSql += fs.readFileSync(path.join(srcDir, f), 'utf-8') + '\n\n';
}

// Very basic parsing by statement
const statements = allSql.split(';').map(s => s.trim()).filter(Boolean);

let core = [];
let admin = [];
let faculty = [];
let student = [];

for (const stmt of statements) {
    const s = stmt.toLowerCase();
    
    // Admin checks
    if (s.includes('sbbhalani') || s.includes("name = 'admin'") || s.includes('fix_admin') || s.includes('fresh_admin')) {
        admin.push(stmt + ';');
    }
    // Faculty checks
    else if (s.includes('faculty') || s.includes('rajanimeet2005') || s.includes('insert into public.events')) {
        // If it's the role creation, it goes to core
        if (s.includes('create policy') && s.includes('events')) {
            core.push(stmt + ';');
        } else {
            faculty.push(stmt + ';');
        }
    }
    // Student checks
    else if (s.includes('student') || s.includes('d25ce143') || s.includes('d24it142') || s.includes('coordinator_requests') || s.includes('coordinator_applications') || s.includes('registrations')) {
        if (s.includes('create table public.registrations') || s.includes('create table public.coordinator_requests')) {
            core.push(stmt + ';');
        } else {
            student.push(stmt + ';');
        }
    }
    // Everything else (tables, extensions, basic alters) goes to core
    else {
        core.push(stmt + ';');
    }
}

fs.writeFileSync(path.join(destDir, '00_core_setup.sql'), core.join('\n\n'));
fs.writeFileSync(path.join(destDir, '01_admin_queries.sql'), admin.join('\n\n'));
fs.writeFileSync(path.join(destDir, '02_faculty_queries.sql'), faculty.join('\n\n'));
fs.writeFileSync(path.join(destDir, '03_student_queries.sql'), student.join('\n\n'));

console.log('Successfully split SQL into roles.');
