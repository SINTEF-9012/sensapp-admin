<%@page trimDirectiveWhitespaces="true"%>
<%@page contentType="*/*" pageEncoding="UTF-8"%>
<%@page import="java.io.*" %>
<%@page import="java.net.*" %>
<%
   String server = request.getParameter("server");
   String port = request.getParameter("port");
   String path = request.getParameter("path");
   URL url = new URL("http", server, Integer.parseInt(port), path);
   InputStream is = url.openStream();
   BufferedReader bread = new BufferedReader(new InputStreamReader(is));
   String line = new String(new byte[0], "UTF-8");
   StringBuffer buff = new StringBuffer();
   while((line = bread.readLine()) != null){ buff.append(line+"\n"); }
   out.print(new String(buff.toString().getBytes(),"UTF-8"));
 %>
