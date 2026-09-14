{{- define "imagePullSecret" }}
{{- with .Values.ImageCredentials }}
{{- printf "{\"auths\":{\"%s\":{\"username\":\"%s\",\"password\":\"%s\",\"email\":\"%s\",\"auth\":\"%s\"}}}" .Registry .Username .Password .Email (printf "%s:%s" .Username .Password | b64enc) | b64enc }}
{{- end }}
{{- end }}