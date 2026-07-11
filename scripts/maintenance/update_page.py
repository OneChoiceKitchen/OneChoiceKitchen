import sys

path = r'c:\Users\priyer\.gemini\antigravity-ide\scratch\restaurant-saas\apps\web\app\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target1 = '''                {tiffinNotices.juiceOfferActive && (
                  <li><strong style={{color:'#b45309'}}>Offers:</strong> On 7 days continuous orders, Sunday lunch juice will be on us.</li>
                )}
                <li>Payment must be made weekly or monthly in advance.</li>
                <li>Tiffin delivery starts from 12:30 PM (Lunch) & 7:30 PM (Dinner).</li>
              </ul>'''

replacement1 = '''                {tiffinNotices.juiceOfferActive && (
                  <li><strong style={{color:'#b45309'}}>Offers:</strong> On 7 days continuous orders, Sunday lunch juice will be on us.</li>
                )}
                {tiffinNotices.importantNoticeText && (
                  <li><strong style={{color:'#b45309'}}>Important Notice:</strong> {tiffinNotices.importantNoticeText}</li>
                )}
                {tiffinNotices.rules && tiffinNotices.rules.map((rule: string, idx: number) => (
                  <li key={idx}>{rule}</li>
                ))}
                {tiffinNotices.trialPolicies && tiffinNotices.trialPolicies.map((policy: string, idx: number) => (
                  <li key={idx}>{policy}</li>
                ))}
              </ul>'''


target2 = '''                        <div style={{ display: 'grid', gap: '0.8rem' }}>
                          <div><strong style={{color:'#64748b', fontSize:'0.85rem', textTransform:'uppercase'}}>Breakfast:</strong> <div style={{color:'#334155'}}>{dayData.breakfast || '-'}</div></div>
                          <div><strong style={{color:'#64748b', fontSize:'0.85rem', textTransform:'uppercase'}}>Lunch:</strong> <div style={{color:'#334155'}}>{dayData.lunch || '-'}</div></div>
                          <div><strong style={{color:'#64748b', fontSize:'0.85rem', textTransform:'uppercase'}}>Dinner:</strong> <div style={{color:'#334155'}}>{dayData.dinner || '-'}</div></div>
                        </div>'''

replacement2 = '''                        <div style={{ display: 'grid', gap: '0.8rem' }}>
                          <div>
                            <strong style={{color:'#64748b', fontSize:'0.85rem', textTransform:'uppercase'}}>Breakfast:</strong> 
                            <div style={{color:'#334155', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                              {dayData.breakfast?.image && <img src={dayData.breakfast.image} alt="Breakfast" style={{width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover'}} />}
                              <span>{dayData.breakfast?.text || dayData.breakfast || '-'}</span>
                            </div>
                          </div>
                          <div>
                            <strong style={{color:'#64748b', fontSize:'0.85rem', textTransform:'uppercase'}}>Lunch:</strong> 
                            <div style={{color:'#334155', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                              {dayData.lunch?.image && <img src={dayData.lunch.image} alt="Lunch" style={{width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover'}} />}
                              <span>{dayData.lunch?.text || dayData.lunch || '-'}</span>
                            </div>
                          </div>
                          <div>
                            <strong style={{color:'#64748b', fontSize:'0.85rem', textTransform:'uppercase'}}>Dinner:</strong> 
                            <div style={{color:'#334155', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                              {dayData.dinner?.image && <img src={dayData.dinner.image} alt="Dinner" style={{width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover'}} />}
                              <span>{dayData.dinner?.text || dayData.dinner || '-'}</span>
                            </div>
                          </div>
                        </div>'''

new_content = content.replace(target1, replacement1).replace(target2, replacement2)

if content != new_content:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced!")
else:
    print("Not found!")
