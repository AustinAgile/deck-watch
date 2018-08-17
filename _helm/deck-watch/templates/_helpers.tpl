{{- define "deck-watch.name" -}}
deck-watch
{{- end -}}

{{- define "global.annotations.standard" }}
Release.Name: {{ .Release.Name | quote }}
Release.Revision: {{ .Release.Revision | quote }}
Release.Heritage: {{ .Release.Service | quote }}
Chart.Name: {{ .Chart.Name | quote }}
Chart.Version: {{ .Chart.Version | quote }}
{{- end }}
