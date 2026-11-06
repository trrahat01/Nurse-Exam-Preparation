import re

file_path = 'D:\\React Native\\Nurse Exam Preparation\\artifacts\\mobile\\app\\_layout.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Replace the Alert.alert line with recovery-specific logic
old_pattern = r"Alert\.alert\('Email Verified!', 'Your email has been verified. Please complete your password setup.'\);"
new_text = """if (type === 'recovery') {
            Alert.alert('Password Recovery Successful!', 'Your recovery link has been verified. Please set your new password.', [
              { text: 'OK', onPress: () => router.push('/auth/reset-password') }
            ]);
          } else {
            Alert.alert('Email Verified!', 'Your email has been verified. Please complete your password setup.');
          }"""

if re.search(old_pattern, content):
    content = re.sub(old_pattern, new_text, content)
    with open(file_path, 'w') as f:
        f.write(content)
    print('Successfully updated _layout.tsx')
else:
    print('Pattern not found')