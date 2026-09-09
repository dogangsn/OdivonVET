"""Build an explicit allowlist; unmatched or composite operations are never silently treated as CRUD."""
from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[1]
inv=json.loads((root/'docs/source-inventory.json').read_text())
s=(root/'src/environments/endPoints.ts').read_text()
paths=list(dict.fromkeys(re.findall(r"['\"]((?:vet|account|mail|identityserver|api|chat)/[^'\"]+)['\"]",s)))
groups={
'productdescription':'VetProducts','productcategory':'VetProductCategories','units':'VetUnits','casedefinition':'VetCasingDefinition','customergroup':'VetCustomerGroupDef','store':'VetStores','suppliers':'VetSuppliers','animalColorsDef':'VetAnimalColorsDef','paymentmethods':'VetPaymentMethods','agenda':'VetAgenda','demandproducts':'VetDemandProducts','demands':'VetDemands','demandTrans':'VetDemandTrans','demandComplate':'VetDemands','parameters':'VetParameters','appointments':'VetAppoointments','appointmenttypes':'VetAppointmentTypes','taxis':'VetTaxis','vaccine':'VetVaccine','vaccineCalendar':'VetVaccineCalendar','shortCuts':'VetShortCuts','stocktracking':'VetStockTracking','smstemplate':'VetSmsTemplate','printtemplate':'VetPrintTemplate','examinations':'VetExamination','patient':'VetPatients','pethotels':'VetAccomodation','customers':'VetCustomers','saleBuy':'VetSaleBuyOwner','lab':'VetLabDocument','filemanager':'VetDocuments'
}
simple_groups={'productdescription','productcategory','units','casedefinition','customergroup','store','suppliers','animalColorsDef','paymentmethods','appointmenttypes','taxis','smstemplate','printtemplate'}
operations=[]
for group,body in re.findall(r'^    (\w+):\s*\{(.*?)^    \}',s,re.M|re.S):
 for key,path in re.findall(r"(\w+)\s*:\s*['\"]([^'\"]+)['\"]",body):
  if not path or group in ['member','gympersonnel']:continue
  action=path.split('/')[-1];lower=action.lower();entity=groups.get(group)
  kind='read' if lower.startswith(('get','all','is','appointmentdate','patientvaccine')) or any(x in lower for x in ['list','filter']) and not lower.startswith(('create','update','delete')) else 'write'
  verb='create' if lower.startswith('create') else 'delete' if lower.startswith(('delete','detele')) else 'update'
  if action=='VetAnimalsTypeList':entity='VetAnimalsType';kind='read'
  if action=='AnimalBreedsDefList':entity='VetAnimalBreedsDef';kind='read'
  if action=='GetSymptoms':entity='VetSymptoms'
  if 'Weight' in action:entity='VetWeightControl'
  if 'Room' in action:entity='VetRooms'
  if any(x in action for x in ['Patients','Patient']) and group=='customers':entity='VetPatients'
  if action=='CreatePatient' or action=='DeletePatient' or action=='UpdatePatient':entity='VetPatients'
  if 'SmsParameters' in action:entity='VetSmsParameters'
  if action=='GetLogs':entity='VetLogs'
  if 'Sales' in action or action in ['CreateSale','UpdateSale']:entity='VetSaleBuyOwner'
  if any(x in action for x in ['Collection','PayChart','PaymentTransaction','TransactionMovement']):entity='VetPaymentCollection'
  if action=='ProductMovementList':entity='VetProductMovements'
  if entity not in inv['entities']: entity=None
  mode='read' if kind=='read' and entity else 'unsupported'
  if group in simple_groups and kind=='write':mode='crud'
  if group in ['agenda','appointments','patient','examinations','pethotels','vaccine','vaccineCalendar','customers','stocktracking','demands','demandproducts','saleBuy'] and kind=='write':mode='composite'
  if group in ['settings','account','auth','title','mailing','message','filemanager','dashboards','clinicalstatistics','reports','chat']:mode='special'
  if action in ['ParametersList']:mode='read'
  if action=='UpdateParameters':mode='crud'
  if entity=='VetSmsParameters':mode='secret'
  operations.append({'path':path,'group':group,'action':action,'entity':entity,'table':inv['entities'][entity]['table'] if entity else '', 'scope':inv['entities'][entity]['scope'] if entity else 'settings','mode':mode,'verb':verb,'parameters':next((o['parameters'] for o in inv['operations'] if o['name'].lower().replace('command','').replace('query','')==lower),[])})
(root/'docs/operations.json').write_text(json.dumps(operations,indent=2),encoding='utf-8')
sql=['create table private.entity_registry(name text primary key, scope text not null);','create table private.operation_registry(path text primary key, entity text, mode text not null, verb text not null);']
for e in inv['entities'].values():sql.append(f"insert into private.entity_registry values ('{e['table']}','{e['scope']}');")
for o in operations:sql.append("insert into private.operation_registry values ('%s','%s','%s','%s');"%(o['path'].lower(),o['table'],o['mode'],o['verb']))
(root/'supabase/clinic/migrations/202609090003_registry.sql').write_text('\n'.join(sql),encoding='utf-8')
lines=['# Vet operation migration inventory','','The status below describes implementation routing, not acceptance verification. Every composite operation requires behavioral tests before release.','','| Existing operation | Target entity | Routing |','|---|---|---|']
lines += [f"| `{o['path']}` | `{o['table']}` | {o['mode']} |" for o in operations]
(root/'docs/feature-inventory.md').write_text('\n'.join(lines),encoding='utf-8')
print(str(len(operations))+' frontend operations registered')
