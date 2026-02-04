# Usar a imagem oficial do Nginx como base
FROM nginx:alpine

# Copiar todos os arquivos do projeto para a pasta padrão do Nginx
COPY . /usr/share/nginx/html

# Expor a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
