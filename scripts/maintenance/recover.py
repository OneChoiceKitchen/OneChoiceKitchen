import json
import re

transcript_path = r"C:\Users\priyer\.gemini\antigravity-ide\brain\2c1ac69c-773c-4737-a880-221a8ccb8822\.system_generated\logs\transcript.jsonl"

found_content = None

with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        # Look for the tool call that replaced the whole file in step 90/91
        if data.get('type') == 'PLANNER_RESPONSE':
            tool_calls = data.get('tool_calls', [])
            for call in tool_calls:
                if call.get('name') == 'multi_replace_file_content' or call.get('name') == 'replace_file_content':
                    args = call.get('args', {})
                    # Need to parse args if it's a string, wait, the transcript has it as dict or string?
                    if isinstance(args, dict):
                        target_file = args.get('TargetFile', '')
                        if 'admin-portal' in target_file and 'app.tsx' in target_file:
                            chunks = args.get('ReplacementChunks', [])
                            if isinstance(chunks, str):
                                try:
                                    chunks = json.loads(chunks)
                                except:
                                    pass
                            for chunk in chunks:
                                if chunk.get('StartLine') == 1:
                                    found_content = chunk.get('TargetContent')
                                    break
        if found_content:
            break

if found_content:
    with open('recovered_admin_app.tsx', 'w', encoding='utf-8') as f:
        f.write(found_content)
    print("Recovered file to recovered_admin_app.tsx")
else:
    print("Could not find the original content in the planner response. Trying to extract from CODE_ACTION diff in step 91...")
    
    # Try to get it from the CODE_ACTION diff
    with open(transcript_path, 'r', encoding='utf-8') as f:
        for line in f:
            data = json.loads(line)
            if data.get('type') == 'CODE_ACTION' and 'admin-portal' in data.get('content', ''):
                content = data.get('content', '')
                if '@@ -1,' in content:
                    diff_lines = content.split('\n')
                    recovered = []
                    in_diff = False
                    for dl in diff_lines:
                        if dl.startswith('@@ -1,'):
                            in_diff = True
                            continue
                        if dl.startswith('@@ '):
                            in_diff = False
                        if in_diff:
                            if dl.startswith('-'):
                                recovered.append(dl[1:]) # remove the minus
                            elif dl.startswith(' '):
                                recovered.append(dl[1:])
                    if recovered:
                        with open('recovered_admin_app.tsx', 'w', encoding='utf-8') as rf:
                            rf.write('\n'.join(recovered))
                        print("Recovered file from diff to recovered_admin_app.tsx")
                        break
