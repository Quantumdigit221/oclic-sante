from pathlib import Path
p=Path('public/assets/index-Cg4yQY5E.js')
s=p.read_text(encoding='utf-8')
old = 'window.history.pushState({},, /patients/+e.patientId)'
new = 'window.history.pushState({},, /patients/+e.patientId)'
if old not in s:
 raise SystemExit('old not found')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('fixed')
